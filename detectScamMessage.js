import openai from './openai.js';

export const detectScamMessage = async (message) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an AI trained to detect scam messages. A scam message often involves asking for personal information, money, or urgent actions, or contains suspicious links. Examples of scams include requests for credit card numbers, fake job offers, or phishing attempts. Please analyze the following message and determine if it is likely a scam. If the message is suspicious and matches common scam patterns, respond with: 'I think it is a scam message.' Otherwise, respond with: 'This does not appear to be a scam message.'" },
                { role: "user", content: message }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const result = response.choices[0].message.content;
        console.log('AI response: ', result);
        return result;
    } catch (error) {
        console.error("Error detecting scam message:", error);
        return false;
    }
};
