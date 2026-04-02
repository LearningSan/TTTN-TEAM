import swaggerJsdoc from "swagger-jsdoc";

export async function GET() {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API",
        version: "1.0.0",
      },
    },
    apis: ["./app/api/**/*.ts"],
  };

  const spec = swaggerJsdoc(options);

  return Response.json(spec);
}