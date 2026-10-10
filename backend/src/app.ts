import Fastify from "fastify";
import swagger from "@fastify/swagger";
import cors from "@fastify/cors";
import routesV1 from "./routesV1.js";

const PORT_NUMBER = Number(process.env.PORT || 8888);
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const fastify = Fastify({
  logger: isProduction ? { level: "info" } : {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  },
});

fastify.get("/", async () => ({ status: "ok" }));

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: "Fastify TypeBox API",
          description: "API documentation using TypeBox and Swagger",
          version: "1.0.0",
        },
        servers: [{ url: "http://localhost:8888" }],
      },
    });

    await fastify.register(cors, {
      origin: ['http://localhost:3000'], // TODO: Use env vars for final URLs
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    await fastify.register(routesV1, { prefix: "/api/v1" });

    await fastify.listen({ port: PORT_NUMBER, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
