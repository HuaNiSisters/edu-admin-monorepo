import type {
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import swaggerUi from "@fastify/swagger-ui";
import userRoutes from "./routes/user.ts";

export default async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  await fastify.register(swaggerUi, {
    routePrefix: "/docs", // Serve the Swagger UI at this path
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });

  fastify.register(userRoutes, { prefix: "/user" });
};
