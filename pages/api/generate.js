import OpenAI from 'openai';

export default async function handler(req, res) {
  console.log("🧠 API route hit");

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("🔐 OPENAI_API_KEY:", apiKey ? "PRESENT ✅" : "MISSING ❌");

  if (!apiKey) {
    return res.status(500).json({
      error: "❌ OPENAI_API_KEY is missing. Set it in Vercel → Settings → Environment Variables.",
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '❌ No message provided in request body.' });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI life planner who creates weekly schedules for time, money, and health.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: '❌ OpenAI did not return a response.' });
    }

    return res.status(200).json({ result });

  } catch (error) {
    const fullError = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    console.error("🔥 OPENAI ERROR:", fullError);

    return res.status(500).json({
      error:
        (typeof error === 'string' && error) ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "❌ Unknown server error occurred during OpenAI call.",
    });
  }
}
