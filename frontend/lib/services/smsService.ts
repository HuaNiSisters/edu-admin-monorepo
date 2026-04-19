import { ISMSRepo } from "../api/interfaces";
import { UpdateSMSTemplateRequest } from "../api/types/sms";

function SMSService(apiWrapper: ISMSRepo) {
  async function getSMSTemplateByIdAsync(templateId: string) {
    return await apiWrapper.getSMSTemplateByIdAsync(templateId);
  }

  async function updateSMSTemplateAsync(
    templateId: string,
    updateParams: UpdateSMSTemplateRequest,
  ) {
    return await apiWrapper.updateSMSTemplateAsync(
      templateId,
      updateParams,
    );
  }

  async function sendSMSTemplateAsync(
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
  ): Promise<void> {
    await apiWrapper.sendSMSTemplateAsync(
      templateId,
      toPhoneNumber,
      templateVariables,
    );
  }

  return {
    getSMSTemplateByIdAsync,
    updateSMSTemplateAsync,
    sendSMSTemplateAsync,
  };
}

export { SMSService };
