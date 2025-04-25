const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Store API",
      version: "1.0.0",
      description: "API documentation for the Book Store project",
    },
    servers: [
      {
        url: "http://localhost:5001/api", // sửa URL cho đúng nếu bạn deploy
      },
    ],
  },
  apis: ["./routes/*.js"], // đường dẫn tới router bạn có @swagger comment
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
