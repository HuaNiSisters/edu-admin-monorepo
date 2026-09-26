import type {
  CreateSMSTemplateRequest,
  GetSMSTemplateResponse,
  ISmsProvider,
  SMSTemplateSummary,
} from "../interfaces/ISmsWrapper.ts";
import { SmsTemplateRepositoryPrisma } from "../repositories/SmsTemplateRepositoryPrisma.ts";
import { SmsWrapperTwilio } from "../repositories/SmsWrapperTwilio.ts";

const smsTemplateRepository = new SmsTemplateRepositoryPrisma();
const providers: ISmsProvider[] = [new SmsWrapperTwilio()];
const defaultProviderName = process.env.SMS_PROVIDER || "twilio";

function getProvider(providerName: string): ISmsProvider {
  const provider = providers.find(({ provider }) => provider === providerName);
  if (!provider) {
    throw new Error(`Unsupported SMS provider: ${providerName}`);
  }
  return provider;
}

function notFound(templateId: string): Error & { statusCode: number } {
  return Object.assign(new Error(`SMS template ${templateId} was not found`), {
    statusCode: 404,
  });
}

async function getSMSTemplatesAsync(): Promise<SMSTemplateSummary[]> {
  const templates = await smsTemplateRepository.getAll();
  return templates.map((template) => ({
    id: template.id,
    provider: template.provider,
    name: template.name,
    variables: Object.values(template.variableMapping),
  }));
}

async function getSMSTemplateByIdAsync(
  templateId: string,
): Promise<GetSMSTemplateResponse> {
  const storedTemplate = await smsTemplateRepository.getById(templateId);
  if (!storedTemplate) throw notFound(templateId);

  const provider = getProvider(storedTemplate.provider);
  const providerTemplate = await provider.getSMSTemplateById(
    storedTemplate.providerTemplateId,
    storedTemplate.variableMapping,
  );
  return {
    id: storedTemplate.id,
    provider: storedTemplate.provider,
    name: providerTemplate.name,
    content: providerTemplate.content,
    variables: Object.values(storedTemplate.variableMapping),
  };
}

async function createSMSTemplateAsync(
  requestParams: CreateSMSTemplateRequest,
): Promise<GetSMSTemplateResponse> {
  const provider = getProvider(defaultProviderName);
  const providerTemplate = await provider.createSMSTemplate(requestParams);

  try {
    const storedTemplate = await smsTemplateRepository.create({
      provider: provider.provider,
      providerTemplateId: providerTemplate.providerTemplateId,
      name: providerTemplate.name,
      variableMapping: providerTemplate.variableMapping,
    });
    return {
      id: storedTemplate.id,
      provider: storedTemplate.provider,
      name: storedTemplate.name,
      content: providerTemplate.content,
      variables: Object.values(storedTemplate.variableMapping),
    };
  } catch (error) {
    try {
      await provider.deleteSMSTemplate(providerTemplate.providerTemplateId);
    } catch (cleanupError) {
      console.error("Failed to remove orphaned provider SMS template", {
        provider: provider.provider,
        providerTemplateId: providerTemplate.providerTemplateId,
        cleanupError,
      });
    }
    throw error;
  }
}

async function updateSMSTemplateAsync(
  templateId: string,
  templateName: string,
  templateContent: string,
): Promise<GetSMSTemplateResponse> {
  const storedTemplate = await smsTemplateRepository.getById(templateId);
  if (!storedTemplate) throw notFound(templateId);

  const provider = getProvider(storedTemplate.provider);
  const providerTemplate = await provider.updateSMSTemplate(
    storedTemplate.providerTemplateId,
    { name: templateName, content: templateContent },
  );
  const updatedTemplate = await smsTemplateRepository.update(templateId, {
    name: providerTemplate.name,
    variableMapping: providerTemplate.variableMapping,
  });
  return {
    id: updatedTemplate.id,
    provider: updatedTemplate.provider,
    name: updatedTemplate.name,
    content: providerTemplate.content,
    variables: Object.values(updatedTemplate.variableMapping),
  };
}

async function sendSMSTemplateAsync(
  templateId: string,
  toPhoneNumber: string,
  variables: Record<string, string> = {},
) {
  const storedTemplate = await smsTemplateRepository.getById(templateId);
  if (!storedTemplate) throw notFound(templateId);

  const provider = getProvider(storedTemplate.provider);
  await provider.sendSMSTemplate(
    storedTemplate.providerTemplateId,
    toPhoneNumber,
    variables,
    storedTemplate.variableMapping,
  );
}

export {
  createSMSTemplateAsync,
  getSMSTemplateByIdAsync,
  getSMSTemplatesAsync,
  updateSMSTemplateAsync,
  sendSMSTemplateAsync,
};
