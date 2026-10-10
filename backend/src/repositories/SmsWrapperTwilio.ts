import axios from "axios";
import Twilio from "twilio";
import type {
  ISmsProvider,
  ProviderSMSTemplate,
  SmsTemplateVariableMapping,
  UpdateSMSTemplateRequest,
} from "../interfaces/ISmsWrapper.js";

const TWILIO_CONTENT_BASE_URL =
  process.env.TWILIO_CONTENT_BASE_URL ||
  "https://content.twilio.com/v1/Content";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

const twilioRequestOptions = {
  auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN },
  headers: { "Content-Type": "application/json" },
};
const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const variableRegex = /{{(.*?)}}/g;
const numericalVariableRegex = /{{(\d+)}}/g;

function buildVariableMapping(content: string): SmsTemplateVariableMapping {
  const variables = [
    ...new Set(
      [...content.matchAll(variableRegex)]
        .map((match) => match[1]?.trim())
        .filter((variable): variable is string => Boolean(variable)),
    ),
  ];
  return Object.fromEntries(
    variables.map((variable, index) => [String(index + 1), variable]),
  );
}

function toNumberedVariables(
  content: string,
  variableMapping: SmsTemplateVariableMapping,
) {
  const variableNumbers = Object.fromEntries(
    Object.entries(variableMapping).map(([number, name]) => [name, number]),
  );
  return content.replace(variableRegex, (_, rawVariableName: string) => {
    const variableName = rawVariableName.trim();
    const variableNumber = variableNumbers[variableName];
    if (!variableNumber) {
      throw new Error(`No Twilio variable mapping exists for ${variableName}`);
    }
    return `{{${variableNumber}}}`;
  });
}

export class SmsWrapperTwilio implements ISmsProvider {
  readonly provider = "twilio";

  async getSMSTemplateById(
    providerTemplateId: string,
    variableMapping: SmsTemplateVariableMapping,
  ): Promise<ProviderSMSTemplate> {
    const response = await axios.get(
      `${TWILIO_CONTENT_BASE_URL}/${providerTemplateId}`,
      twilioRequestOptions,
    );
    const numberedContent = response.data.types["twilio/text"].body as string;
    const content = numberedContent.replace(
      numericalVariableRegex,
      (_, variableNumber: string) => {
        const variableName = variableMapping[variableNumber];
        if (!variableName) {
          throw new Error(
            `No local variable mapping exists for Twilio variable ${variableNumber}`,
          );
        }
        return `{{${variableName}}}`;
      },
    );
    return {
      providerTemplateId: response.data.sid,
      name: response.data.friendly_name,
      content,
      variableMapping,
    };
  }

  async createSMSTemplate(
    requestParams: UpdateSMSTemplateRequest,
  ): Promise<ProviderSMSTemplate> {
    const variableMapping = buildVariableMapping(requestParams.content);
    const numberedContent = toNumberedVariables(
      requestParams.content,
      variableMapping,
    );
    const response = await axios.post(
      TWILIO_CONTENT_BASE_URL,
      {
        friendly_name: requestParams.name,
        language: "en",
        variables: variableMapping,
        types: { "twilio/text": { body: numberedContent } },
      },
      twilioRequestOptions,
    );
    return {
      providerTemplateId: response.data.sid,
      name: response.data.friendly_name,
      content: requestParams.content,
      variableMapping,
    };
  }

  async updateSMSTemplate(
    providerTemplateId: string,
    requestParams: UpdateSMSTemplateRequest,
  ): Promise<ProviderSMSTemplate> {
    const variableMapping = buildVariableMapping(requestParams.content);
    const numberedContent = toNumberedVariables(
      requestParams.content,
      variableMapping,
    );
    const response = await axios.put(
      `${TWILIO_CONTENT_BASE_URL}/${providerTemplateId}`,
      {
        friendly_name: requestParams.name,
        variables: variableMapping,
        types: { "twilio/text": { body: numberedContent } },
      },
      twilioRequestOptions,
    );
    return {
      providerTemplateId: response.data.sid,
      name: response.data.friendly_name,
      content: requestParams.content,
      variableMapping,
    };
  }

  async deleteSMSTemplate(providerTemplateId: string): Promise<void> {
    await axios.delete(
      `${TWILIO_CONTENT_BASE_URL}/${providerTemplateId}`,
      twilioRequestOptions,
    );
  }

  async sendSMSTemplate(
    providerTemplateId: string,
    toPhoneNumber: string,
    templateVariables: Record<string, string>,
    variableMapping: SmsTemplateVariableMapping,
  ): Promise<string> {
    const contentVariables = Object.fromEntries(
      Object.entries(variableMapping).map(([number, variableName]) => {
        const value = templateVariables[variableName];
        if (value === undefined) {
          throw new Error(`Missing SMS template variable: ${variableName}`);
        }
        return [number, value];
      }),
    );
    const message = await client.messages.create({
      contentSid: providerTemplateId,
      to: toPhoneNumber,
      from: TWILIO_PHONE_NUMBER,
      contentVariables: JSON.stringify(contentVariables),
    });
    return message.sid;
  }
}
