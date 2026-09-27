import { ISMSRepo } from "../api/adapters/interfaces";
import {
  OwingSmsContext,
  OwingSmsSend,
  CreateSMSTemplateRequest,
  UpdateSMSTemplateRequest,
} from "../api/types/sms";

function SMSService(apiWrapper: ISMSRepo) {
  async function getOwingSmsSendsAsync(): Promise<OwingSmsSend[]> {
    return apiWrapper.getOwingSmsSendsAsync();
  }

  async function getSMSTemplatesAsync() {
    return await apiWrapper.getSMSTemplatesAsync();
  }

  async function createSMSTemplateAsync(
    createParams: CreateSMSTemplateRequest,
  ) {
    return await apiWrapper.createSMSTemplateAsync(createParams);
  }

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
    owing?: OwingSmsContext,
  ): Promise<void> {
    await apiWrapper.sendSMSTemplateAsync(
      templateId,
      toPhoneNumber,
      templateVariables,
      owing,
    );
  }

  return {
    getSmsSendMode: apiWrapper.getSmsSendMode,
    getOwingSmsSendsAsync,
    getSMSTemplatesAsync,
    createSMSTemplateAsync,
    getSMSTemplateByIdAsync,
    updateSMSTemplateAsync,
    sendSMSTemplateAsync,
  };
}

export { SMSService };
