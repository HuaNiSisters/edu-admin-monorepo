import type { SmsReminderType } from "../../generated/prisma/enums.ts";

export type ReminderType = SmsReminderType;

// MAKE THIS SHARED
export interface GetSMSTemplateResponse {
  id: string;
  provider: string;
  name: string;
  content: string;
  variables: string[];
}

export interface UpdateSMSTemplateRequest {
  name: string;
  content: string;
}

export interface SMSTemplateSummary {
  id: string;
  provider: string;
  name: string;
  variables: string[];
}

export interface CreateSMSTemplateRequest {
  name: string;
  content: string;
}

export type SmsTemplateVariableMapping = Record<string, string>;

export interface ProviderSMSTemplate {
  providerTemplateId: string;
  name: string;
  content: string;
  variableMapping: SmsTemplateVariableMapping;
}

export interface ISmsProvider {
  readonly provider: string;
  getSMSTemplateById(
    providerTemplateId: string,
    variableMapping: SmsTemplateVariableMapping,
  ): Promise<ProviderSMSTemplate>;
  createSMSTemplate(
    requestParams: UpdateSMSTemplateRequest,
  ): Promise<ProviderSMSTemplate>;
  updateSMSTemplate(
    providerTemplateId: string,
    requestParams: UpdateSMSTemplateRequest,
  ): Promise<ProviderSMSTemplate>;
  deleteSMSTemplate(providerTemplateId: string): Promise<void>;
  sendSMSTemplate(
    providerTemplateId: string,
    toPhoneNumber: string,
    variables: Record<string, string>,
    variableMapping: SmsTemplateVariableMapping,
  ): Promise<string>;
}
