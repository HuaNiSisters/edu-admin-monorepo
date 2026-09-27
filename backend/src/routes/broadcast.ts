import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  getSmsSendMode,
  getOwingSmsSendsAsync,
  createSMSTemplateAsync,
  getSMSTemplateByIdAsync,
  getSMSTemplatesAsync,
  sendSMSTemplateAsync,
  updateSMSTemplateAsync,
} from "../service/smsService.ts";
import type { GetSMSTemplateResponse } from "../interfaces/ISmsWrapper.ts";

async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  const app = fastify;

  app.get("/sms-send-mode", async () => getSmsSendMode());

  app.get("/owing-sms-sends", async () => getOwingSmsSendsAsync());

  app.get("/template/sms", async () => getSMSTemplatesAsync());

  app.post(
    "/template/sms",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "content"],
          additionalProperties: false,
          properties: {
            name: { type: "string", minLength: 1 },
            content: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: {
          name: string;
          content: string;
        };
      }>,
      reply,
    ) => {
      const template = await createSMSTemplateAsync(request.body);
      return reply.code(201).send(template);
    },
  );

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
    {
      schema: {
        body: {
          type: "object",
          required: ["templateId", "toPhoneNumber"],
          properties: {
            templateId: { type: "string", format: "uuid" },
            toPhoneNumber: { type: "string", minLength: 1 },
            templateVariables: { type: "object", additionalProperties: { type: "string" } },
            owing: {
              type: "object", required: ["enrolmentId", "termId"], additionalProperties: false,
              properties: {
                enrolmentId: { type: "string", format: "uuid" },
                termId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: {
          templateId: string;
          toPhoneNumber: string;
          templateVariables?: Record<string, string>;
          owing?: { enrolmentId: string; termId: string };
        };
      }>,
    ) => {
      const { templateId, toPhoneNumber, templateVariables, owing } = request.body;
      await sendSMSTemplateAsync(templateId, toPhoneNumber, templateVariables, owing);
      return { message: getSmsSendMode().mock ? "Mock send saved; no SMS sent" : "SMS sent successfully" };
    },
  );
}

export default routes;
