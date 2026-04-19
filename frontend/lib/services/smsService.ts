import { ourBackendAdapter } from "../api/adapters/ourBackendAdapter";
import { UpdateSMSTemplateRequest } from "../api/types/sms";

function smsService() {
  async function getSMSTemplateByIdAsync(templateId: string) {
    return await ourBackendAdapter.getSMSTemplateByIdAsync(templateId);
  }

  async function updateSMSTemplateAsync(
    templateId: string,
    updateParams: UpdateSMSTemplateRequest,
  ) {
    return await ourBackendAdapter.updateSMSTemplateAsync(
      templateId,
      updateParams,
    );
  }

  async function sendSMSTemplateAsync(
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
  ): Promise<void> {
    await ourBackendAdapter.sendSMSTemplateAsync(
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

export const smsApi = smsService();
