const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

// Load environment variables from .env file
dotenv.config({
  path: path.join(__dirname, "../../.env"),
  quiet: true,
  debug: process.env.NODE_ENV === "development" ? true : false,
});

// Define validation schema for environment variables
const env_vars_schema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("production", "development", "test").required(),
    PORT: Joi.number().default(8888),
    POSTGRESQL_URL: Joi.string().required().description("PostgreSQL DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
  })
  .unknown();

// Validate environment variables
const { value: env_vars, error } = env_vars_schema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

// Throw error if validation fails
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config_env = {
  env: env_vars.NODE_ENV,
  port: env_vars.PORT,
  postgresql: {
    url: env_vars.POSTGRESQL_URL + (env_vars.NODE_ENV === "test" ? "-test" : ""),
  },
  jwt: {
    secret: env_vars.JWT_SECRET,
    accessExpirationMinutes: env_vars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: env_vars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: env_vars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: env_vars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
};

module.exports = config_env;
