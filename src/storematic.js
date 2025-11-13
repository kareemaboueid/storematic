const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const env = require("./config/env.config");
const morgan = require("./config/morgan.config");
const request_id = require("./middlewares/request-id.middleware");
const rate_limiter = require("./middlewares/rate-limiter.middleware");
const error_converter = require("./middlewares/error-converter.middleware");
const error_handler = require("./middlewares/error-handler.middleware");
const ApiError = require("./utils/api-error.util");

// initialize express app
const storematic_app = express();

// assign request ID as early as possible
storematic_app.use(request_id);

// log requests in dev environment
if (env.env !== "test") {
  storematic_app.use(morgan.success_logger);
  storematic_app.use(morgan.error_logger);
}

// set security HTTP headers
storematic_app.use(helmet());

// parse json request body
storematic_app.use(express.json());

// parse urlencoded request body
storematic_app.use(express.urlencoded({ extended: true }));

// gzip compression
storematic_app.use(compression());

// enable cors
storematic_app.use(cors());

// limit repeated failed requests to auth endpoints
if (env.env === "production") {
  storematic_app.use("/v1/auth", rate_limiter);
}

// check health endpoint
storematic_app.get("/health", (request, response) => {
  response.status(StatusCodes.OK).json({ status: "OK" });
});

// send back a 404 error for any unknown api request
storematic_app.use((request, response, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
storematic_app.use(error_converter);

// handle error
storematic_app.use(error_handler);

module.exports = storematic_app;
