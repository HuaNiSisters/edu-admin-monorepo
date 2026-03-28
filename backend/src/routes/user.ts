import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { getUserByIdAsync } from "../service/userService.ts";

async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  const app = fastify;

  app.get(
    "/:userId",
    // // For OpenAPI
    // {
    //   schema: {
    //     params: {
    //       type: "object",
    //       properties: {
    //         userId: { type: "string" },
    //       },
    //     },
    //   },
    // },
    async (request: FastifyRequest<{ Params: { userId: string } }>) => {
      const { userId } = request.params;
      console.log("eeeeeeeeeeeeeeeees")
      // const user = await getUserByIdAsync(userId);
      return { success: true, userId };
    },
  );
}

export default routes;
