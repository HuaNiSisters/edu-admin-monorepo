import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888/api/v1/broadcast";

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

// ERROR HANDLING
class SMSApi {
  async getSMSTemplateByIdAsync(
    templateId: string,
  ): Promise<GetSMSTemplateResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/template/sms/${templateId}`,
    );
    const responseData = response.data;
    // console.log({ responseData });
    return responseData;
  }

  async updateSMSTemplateAsync(
    templateId: string,
    updateParams: UpdateSMSTemplateRequest,
  ): Promise<string> {
    const response = await axios.put(
      `${API_BASE_URL}/template/sms/${templateId}`,
      updateParams,
    );
    const responseData = response.data;
    return responseData;
  }

  async sendSMSTemplateAsync(
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
  ): Promise<void> {
    await axios.post(`${API_BASE_URL}/send-sms`, {
      templateId,
      toPhoneNumber,
      templateVariables,
    });
  }
}

export const smsApi = new SMSApi();
