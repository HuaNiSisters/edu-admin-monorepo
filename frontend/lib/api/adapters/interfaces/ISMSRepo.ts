import {
  CreateSMSTemplateRequest,
  GetSMSTemplateResponse,
  SMSTemplateSummary,
  UpdateSMSTemplateRequest,
} from "../../types/sms";

interface ISMSRepo {
  getSMSTemplatesAsync: () => Promise<SMSTemplateSummary[]>;
  createSMSTemplateAsync: (
    data: CreateSMSTemplateRequest,
  ) => Promise<GetSMSTemplateResponse>;
  getSMSTemplateByIdAsync: (id: string) => Promise<GetSMSTemplateResponse>;
  updateSMSTemplateAsync: (
    id: string,
    data: UpdateSMSTemplateRequest,
  ) => Promise<GetSMSTemplateResponse>;
  sendSMSTemplateAsync: (
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
  ) => Promise<void>;
}

export type { ISMSRepo };
