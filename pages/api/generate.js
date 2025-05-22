import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  console.log("🧠 API route hit");

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("🔐 OPENAI_API_KEY:", apiKey ? "PRESENT ✅" : "MISSING ❌");

  if (!apiKey) {
    return res.status(500).json({
      error: "❌ OPENAI_API_KEY is missing. Please set it in Vercel → Settings → Environment Variables.",
    });
  }

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    console.log("⚠️ No message provided in body");
    return res.status(400).json({ error: '❌ No message provided.' });
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o', // You can change to 'gpt-3.5-turbo' if you don't have access
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI life planner that gives users simple, effective weekly plans based on their needs.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const output = response.data?.choices?.[0]?.message?.content;

    if (!output) {
      throw new Error("❌ No response from OpenAI");
    }

    console.log("✅ Plan generated:", output);
    res.status(200).json({ result: output });

  } catch (error) {
    const fullError = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    console.error("🔥 FULL ERROR OBJECT:", fullError);

    res.status(500).json({
      error: fullError || '❌ Internal Server Error',
    });
  }
}
