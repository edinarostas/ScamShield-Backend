import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION_ID,
    project: process.env.PROJECT_ID,
});

export default openai;