

// TO BE SHARED
export interface GetSMSTemplateResponse {
  id: string;
  provider: string;
  name: string;
  content: string;
  variables: string[];
}

export interface SMSTemplateSummary {
  id: string;
  provider: string;
  name: string;
  variables: string[];
}

export interface UpdateSMSTemplateRequest {
  name: string;
  content: string;
}

export type CreateSMSTemplateRequest = UpdateSMSTemplateRequest;
