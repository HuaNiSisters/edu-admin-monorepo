import { GetSMSTemplateResponse, UpdateSMSTemplateRequest } from "../types/sms";

interface ISMSRepo {
  getSMSTemplateByIdAsync: (id: string) => Promise<GetSMSTemplateResponse>;
  updateSMSTemplateAsync: (
    id: string,
    data: UpdateSMSTemplateRequest,
  ) => Promise<string>;
  sendSMSTemplateAsync: (
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
  ) => Promise<void>;
}

export type { ISMSRepo };
