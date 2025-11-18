const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const config_env = require("./config/env.config");
const config_morgan = require("./config/morgan.config");
const middleware_request_id = require("./middlewares/request-id.middleware");
const middleware_rate_limiter = require("./middlewares/rate-limiter.middleware");
const middleware_error_converter = require("./middlewares/error-converter.middleware");
const middleware_error_handler = require("./middlewares/error-handler.middleware");
const UtlApiError = require("./utils/api-error.util");

// initialize express app
const storematic_app = express();

// assign request ID as early as possible
storematic_app.use(middleware_request_id);

// log requests in dev environment
if (config_env.env !== "test") {
  storematic_app.use(config_morgan.success_logger);
  storematic_app.use(config_morgan.error_logger);
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
if (config_env.env === "production") {
  storematic_app.use("/v1/auth", middleware_rate_limiter);
}

// check health endpoint
storematic_app.get("/health", (p_request, p_response) => {
  p_response.status(StatusCodes.OK).json({ status: "OK" });
});

// send back a 404 error for any unknown api request
storematic_app.use((p_request, p_response, p_next) => {
  p_next(new UtlApiError(StatusCodes.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
storematic_app.use(middleware_error_converter);

// handle error
storematic_app.use(middleware_error_handler);

module.exports = storematic_app;
