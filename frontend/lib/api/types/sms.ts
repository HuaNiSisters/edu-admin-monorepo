

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

export type OwingSmsContext = { enrolmentId: string; termId: string };
export type OwingSmsSend = {
  enrolment_id: string;
  term_id: string;
  template_id: string;
  phone_number: string;
};
