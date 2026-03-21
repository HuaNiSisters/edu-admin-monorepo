import Fastify from "fastify";
import swagger from "@fastify/swagger";
import routesV1 from "./routesV1.ts";

const PORT_NUMBER = 8888;

const fastify = Fastify({
  logger: {
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

    await fastify.register(routesV1, { prefix: "/api/v1" });

    await fastify.listen({ port: PORT_NUMBER, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();