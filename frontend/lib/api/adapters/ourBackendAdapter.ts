import axios from "axios";
import {
  OwingSmsContext,
  OwingSmsSend,
  CreateSMSTemplateRequest,
  GetSMSTemplateResponse,
  SMSTemplateSummary,
  UpdateSMSTemplateRequest,
} from "../types/sms";
import { ISMSRepo } from "./interfaces/ISMSRepo";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888/api/v1/broadcast";

function ourBackendAdapter(): ISMSRepo {
  async function getSmsSendMode(): Promise<{ mock: boolean }> {
    return (await axios.get(`${API_BASE_URL}/sms-send-mode`)).data;
  }

  async function getOwingSmsSendsAsync(): Promise<OwingSmsSend[]> {
    return (await axios.get(`${API_BASE_URL}/owing-sms-sends`)).data;
  }

  // ERROR HANDLING
  async function getSMSTemplatesAsync(): Promise<SMSTemplateSummary[]> {
    const response = await axios.get(`${API_BASE_URL}/template/sms`);
    return response.data;
  }

  async function createSMSTemplateAsync(
    createParams: CreateSMSTemplateRequest,
  ): Promise<GetSMSTemplateResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/template/sms`,
      createParams,
    );
    return response.data;
  }

  async function getSMSTemplateByIdAsync(
    templateId: string,
  ): Promise<GetSMSTemplateResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/template/sms/${templateId}`,
    );
    const responseData = response.data;
    // console.log({ responseData });
    return responseData;
  }

  async function updateSMSTemplateAsync(
    templateId: string,
    updateParams: UpdateSMSTemplateRequest,
  ): Promise<GetSMSTemplateResponse> {
    const response = await axios.put(
      `${API_BASE_URL}/template/sms/${templateId}`,
      updateParams,
    );
    const responseData = response.data;
    return responseData;
  }

  async function sendSMSTemplateAsync(
    templateId: string,
    toPhoneNumber: string,
    templateVariables?: Record<string, string>,
    owing?: OwingSmsContext,
  ): Promise<void> {
    await axios.post(`${API_BASE_URL}/send-sms`, {
      templateId,
      toPhoneNumber,
      templateVariables,
      owing,
    });
  }

  return {
    getSmsSendMode,
    getOwingSmsSendsAsync,
    getSMSTemplatesAsync,
    createSMSTemplateAsync,
    getSMSTemplateByIdAsync,
    updateSMSTemplateAsync,
    sendSMSTemplateAsync,
  };
}

export { ourBackendAdapter };
