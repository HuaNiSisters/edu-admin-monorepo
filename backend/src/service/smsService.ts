import { SmsWrapperTwilio } from "../repositories/SmsWrapperTwilio.ts";

const smsServiceWrapper = new SmsWrapperTwilio();

async function getSMSTemplateByIdAsync(templateId: string) {
  const template = await smsServiceWrapper.getSMSTemplateById(templateId);
  return template;
}

async function updateSMSTemplateAsync(
  templateId: string,
  templateName: string,
  templateContent: string,
) {
  const result = await smsServiceWrapper.updateSMSTemplate(templateId, {
    name: templateName,
    content: templateContent,
  });
  return result;
}

async function sendSMSTemplateAsync(
  templateId: string,
  toPhoneNumber: string,
  variables: any,
) {
  await smsServiceWrapper.sendSMSTemplate(templateId, toPhoneNumber, variables);
}

export { getSMSTemplateByIdAsync, updateSMSTemplateAsync, sendSMSTemplateAsync };
