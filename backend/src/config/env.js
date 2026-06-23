const dotenv = require('dotenv');
const joi = require('joi');

dotenv.config();

const envVarsSchema = joi.object({
  NODE_ENV: joi.string().valid('production', 'development', 'test').required(),
  PORT: joi.number().default(3000),
  REDIS_URL: joi.string().required().description('Redis url'),
  GEMINI_API_KEY: joi.string().required().description('Gemini API Key'),
  MONGODB_URI: joi.string().required().description('MongoDB URI'),
  JWT_ACCESS_SECRET: joi.string().required().description('JWT Access Secret'),
  JWT_REFRESH_SECRET: joi.string().required().description('JWT Refresh Secret'),
  MSG91_AUTH_KEY: joi.string().required().description('MSG91 Auth Key'),
  MSG91_TEMPLATE_ID: joi.string().required().description('MSG91 Template ID'),
  RESEND_API_KEY: joi.string().required().description('Resend API Key'),
  OPENAI_API_KEY: joi.string().required().description('OpenAI API Key'),
  MASTERS_INDIA_CLIENT_ID: joi.string().required().description('Masters India Client ID'),
  MASTERS_INDIA_CLIENT_SECRET: joi.string().required().description('Masters India Client Secret'),
  MASTERS_INDIA_USERNAME: joi.string().required().description('Masters India Username'),
  MASTERS_INDIA_PASSWORD: joi.string().required().description('Masters India Password')
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  redis: {
    url: envVars.REDIS_URL,
  },
  gemini: {
    apiKey: envVars.GEMINI_API_KEY,
  },
  openai: {
    apiKey: envVars.OPENAI_API_KEY,
  },
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
  },
  msg91: {
    authKey: envVars.MSG91_AUTH_KEY,
    templateId: envVars.MSG91_TEMPLATE_ID,
  },
  resend: {
    apiKey: envVars.RESEND_API_KEY,
  },
  mastersIndia: {
    clientId: envVars.MASTERS_INDIA_CLIENT_ID,
    clientSecret: envVars.MASTERS_INDIA_CLIENT_SECRET,
    username: envVars.MASTERS_INDIA_USERNAME,
    password: envVars.MASTERS_INDIA_PASSWORD
  }
};
