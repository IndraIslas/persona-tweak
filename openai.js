const OpenAI = require("openai");
require("dotenv").config();

openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

async function createCompletion(prompt, description) {
    const response = await this.openai.chat.completions.create({
        model: process.env.GPT_MODEL,
        messages: [
            {
                role: "system",
                content: description,
            },
            { role: "user", content: prompt },
        ],
    });
    return response.choices[0].message.content;
}

module.exports = { createCompletion };
