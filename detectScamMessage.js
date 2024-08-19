import openai from './openai.js';

export const detectScamMessage = async (message) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an AI that detects scam messages. If you detect that the content is a scam message, just respond with a sentence: I think it is a scam message." },
                { role: "user", content: message }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const result = response.choices[0].message.content;
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error detecting scam message:", error);
        return false;
    }
};
