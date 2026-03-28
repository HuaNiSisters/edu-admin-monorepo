// MAKE THIS SHARED
export interface GetSMSTemplateResponse {
  id: string;
  name: string;
  content: string;
}

export interface UpdateSMSTemplateRequest {
  name: string;
  content: string;
}

export interface ISmsWrapper {
  getSMSTemplateById(templateId: string): Promise<GetSMSTemplateResponse>;
  updateSMSTemplate(templateId: string, requestParams: UpdateSMSTemplateRequest): Promise<string>;
  sendSMSTemplate(templateId: string, toPhoneNumber: string, variables: any): Promise<void>;
}
