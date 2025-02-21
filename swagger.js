const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Parasition APIs",
        description: "",
    },
    host: "",
    schemes: ["http"],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};

const outputFile = "./swagger-output.json";
const routes = ["./index.js"];

swaggerAutogen(outputFile, routes, doc).then(() => {
    require("./index.js");
});
