import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  getSMSTemplateByIdAsync,
  sendSMSTemplateAsync,
  updateSMSTemplateAsync,
} from "../service/smsService.ts";
import type { GetSMSTemplateResponse } from "../interfaces/ISmsWrapper.ts";

async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  const app = fastify;

  app.get(
    "/template/sms/:templateId",
    // // For OpenAPI
    // {
    //   schema: {
    //     params: {
    //       type: "object",
    //       properties: {
    //         templateId: { type: "string" },
    //       },
    //     },
    //   },
    // },
    async (
      request: FastifyRequest<{
        Params: { templateId: string };
        Reply: GetSMSTemplateResponse;
      }>,
    ) => {
      const { templateId } = request.params;
      const getTemplateResponse = await getSMSTemplateByIdAsync(templateId);
      return getTemplateResponse;
    },
  );

  app.put(
    "/template/sms/:templateId",
    // // For OpenAPI
    {
      schema: {
        params: {
          type: "object",
          properties: {
            templateId: { type: "string" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: {
          templateId: string;
        };
        Body: {
          name: string;
          content: string;
        };
      }>,
    ) => {
      const { templateId } = request.params;
      const { name, content } = request.body;
      const result = await updateSMSTemplateAsync(templateId, name, content);
      return result;
    },
  );

  app.post(
    "/send-sms",
    async (
      request: FastifyRequest<{
        Body: {
          templateId: string;
          toPhoneNumber: string;
          templateVariables?: Record<string, string>;
        };
      }>,
    ) => {
      const { templateId, toPhoneNumber, templateVariables } = request.body;
      console.log({ templateId, toPhoneNumber, templateVariables });
      await sendSMSTemplateAsync(templateId, toPhoneNumber, templateVariables);
      return { message: "SMS sent successfully" };
    },
  );
}

export default routes;
