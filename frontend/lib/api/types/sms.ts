

// TO BE SHARED
export interface GetSMSTemplateResponse {
  id: string;
  name: string;
  content: string;
}

export interface UpdateSMSTemplateRequest {
  name: string;
  content: string;
}