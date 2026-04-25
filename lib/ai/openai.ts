import OpenAI from 'openai';

const provider = process.env.LLM_PROVIDER || 'openai';

if (provider === 'azure') {
  // Azure OpenAI configuration
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error('Missing AZURE_OPENAI_API_KEY environment variable');
  }
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error('Missing AZURE_OPENAI_ENDPOINT environment variable');
  }
  if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
    throw new Error('Missing AZURE_OPENAI_DEPLOYMENT_NAME environment variable');
  }
} else {
  // Standard OpenAI configuration
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
}

export const openai = new OpenAI(
  provider === 'azure'
    ? {
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
      }
    : {
        apiKey: process.env.OPENAI_API_KEY,
      }
);
