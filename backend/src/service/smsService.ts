import { prisma } from "../lib/prisma.ts";
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

function getSmsSendMode(): { mock: boolean } {
  const mock = process.env.SMS_MOCK_SEND === "true";
  if (mock && process.env.NODE_ENV === "production") {
    throw new Error("SMS_MOCK_SEND must be disabled in production");
  }
  return { mock };
}

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
  owing?: { enrolmentId: string; termId: string },
): Promise<string | null> {
  const { mock } = getSmsSendMode();
  const storedTemplate = await smsTemplateRepository.getById(templateId);
  if (!storedTemplate) throw notFound(templateId);

  const sendKey = owing ? {
    enrolment_id: owing.enrolmentId,
    term_id: owing.termId,
    template_id: templateId,
    phone_number: toPhoneNumber,
  } : undefined;
  if (sendKey) {
    const enrolment = await prisma.enrolment.findUnique({
      where: { enrolment_id: sendKey.enrolment_id },
    });
    if (!enrolment || enrolment.term_id !== sendKey.term_id) {
      throw Object.assign(new Error("Enrolment does not belong to this term"), { statusCode: 400 });
    }
    const previous = await prisma.owingSmsSend.findUnique({
      where: { enrolment_id_term_id_template_id_phone_number: sendKey },
    });
    if (previous) return null;
  }
  let providerMessageId: string | null = null;
  if (!mock) {
    const provider = getProvider(storedTemplate.provider);
    providerMessageId = await provider.sendSMSTemplate(
      storedTemplate.providerTemplateId,
      toPhoneNumber,
      variables,
      storedTemplate.variableMapping,
    );
  }
  // Mock sends intentionally persist the same status so the owing workflow
  // can be exercised without submitting a message to the provider.
  if (sendKey) {
    await prisma.owingSmsSend.upsert({
      where: { enrolment_id_term_id_template_id_phone_number: sendKey },
      create: sendKey,
      update: {},
    });
  }
  return providerMessageId;
}

async function getOwingSmsSendsAsync() {
  return prisma.owingSmsSend.findMany({
    select: { enrolment_id: true, term_id: true, template_id: true, phone_number: true },
  });
}

export {
  getSmsSendMode,
  getOwingSmsSendsAsync,
  createSMSTemplateAsync,
  getSMSTemplateByIdAsync,
  getSMSTemplatesAsync,
  updateSMSTemplateAsync,
  sendSMSTemplateAsync,
};
