import swaggerJsdoc from "swagger-jsdoc";

export async function GET() {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API",
        version: "1.0.0",
      },
      tags:[
      {name: "ForgotPassword", description: "API liên quan đến quên mật khẩu"},
      {name: "Payment", description: "API liên quan đến thanh toán"},
      {name: "Order", description: "API liên quan đến đơn hàng"},
      {name:"Login", description: "API liên quan đến đăng nhập và xác thực"},
      {name:"Concert", description: "API liên quan đến concert"},
      {name:"Tickets", description: "API liên quan đến vé"},
      {name:"Zone", description: "API liên quan đến zone"},
      { name: "Seat", description: "API liên quan đến ghế ngồi" },
      ]
    },
    apis: ["./app/api/**/*.ts"],
  };

  const spec = swaggerJsdoc(options);

  return Response.json(spec);
}