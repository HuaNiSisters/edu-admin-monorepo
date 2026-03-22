import axios from "axios";
import Twilio from "twilio";
import type {
  ISmsWrapper,
  UpdateSMSTemplateRequest,
} from "../interfaces/ISmsWrapper.ts";

const TWILIO_BASE_URL =
  process.env.TWILIO_BASE_URL || "https://api.twilio.com/2010-04-01";

const TWILIO_CONTENT_BASE_URL =
  process.env.TWILIO_CONTENT_BASE_URL ||
  "https://content.twilio.com/v1/Content";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_KEY_SID = process.env.TWILIO_KEY_SID || "";
const TWILIO_KEY_SECRET = process.env.TWILIO_KEY_SECRET || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

const twilioApiAuth = {
  username: TWILIO_ACCOUNT_SID,
  password: TWILIO_AUTH_TOKEN,
};

const twilioHeaders = {
  "Content-Type": "application/json",
};

const twiolioRequestOptions = {
  auth: twilioApiAuth,
  headers: twilioHeaders,
};

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const variableRegex = /{{(.*?)}}/g;
const numericalVariableRegex = /{{(\d+)}}/g;

// ERROR HANDLING

// TODO: Store and get mapping from Database
const variablesMapping = {
  "1": "student.full_name",
  "2": "term.week_number",
  "3": "term.number",
  "4": "term.n_weeks",
  "5": "term.start_date",
  "6": "term.end_date",
  "7": "invoice.amount_due",
  "8": "subject.name",
};

export class SmsWrapperTwilio implements ISmsWrapper {
  async getSMSTemplateById(templateId: string) {
    const fetchResponse = await axios.get(
      `${TWILIO_CONTENT_BASE_URL}/${templateId}`,
      twiolioRequestOptions,
    );

    const fetchResponseData = fetchResponse.data;

    const templateWithNumberedVariables =
      fetchResponseData.types["twilio/text"].body;
    const templateWithMappedVariables = templateWithNumberedVariables.replace(
      numericalVariableRegex,
      // @ts-ignore
      (_, variableNumber) => {
        // @ts-ignore
        const variableKey = variablesMapping[variableNumber];
        return `{{${variableKey}}}`;
      },
    );

    const returnResult = {
      id: fetchResponseData.sid,
      name: fetchResponseData.friendly_name,
      content: templateWithMappedVariables,
      variables: Object.values(variablesMapping),
    };
    console.log({ returnResult });
    return returnResult;
  }

  async updateSMSTemplate(
    templateId: string,
    updateParams: UpdateSMSTemplateRequest,
  ): Promise<string> {
    // Extract variables from the content and create a mapping to the provided variables
    const extractedVariables = [
      ...updateParams.content.matchAll(variableRegex),
    ].map((match) => match[1]);

    const variablesMapping = Object.fromEntries(
      extractedVariables.map((variable, index) => [
        String(index + 1),
        variable,
      ]),
    );
    console.log({ variablesMapping });

    // SAVE THE MAPPING
    const templateWithNumberedVariables = updateParams.content.replace(
      variableRegex,
      (_, variableKey) => {
        const variableNumber = Object.keys(variablesMapping).find(
          (key) => variablesMapping[key] === variableKey,
        );
        return `{{${variableNumber}}}`;
      },
    );

    const updateResponse = await axios.put(
      `${TWILIO_CONTENT_BASE_URL}/${templateId}`,
      {
        friendly_name: updateParams.name,
        // variables: variablesMapping, // Should provide examples of each variable
        types: {
          "twilio/text": {
            body: templateWithNumberedVariables,
          },
        },
      },
      twiolioRequestOptions,
    );
    const updateReponseData = updateResponse.data;
    console.log({ updateReponseData });
    return templateWithNumberedVariables;
  }

  async sendSMSTemplate(
    templateId: string,
    toPhoneNumber: string,
    templateVariables: Record<string, string>,
  ) {
    console.log({ toPhoneNumber, templateId, templateVariables });

    const sendSMSParams = {
      contentSid: templateId,
      to: toPhoneNumber,
      from: TWILIO_PHONE_NUMBER,
      contentVariables: JSON.stringify(
        Object.fromEntries(
          Object.entries(templateVariables).map(([key, value], index) => [
            index + 1,
            value,
          ]),
        ),
      ),
    };
    console.log({ sendSMSParams });

    await client.messages.create(sendSMSParams);
  }
}
