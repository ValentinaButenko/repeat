import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text, from, to } = await req.json().catch(() => ({ text: '', from: 'auto', to: 'EN' }));
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini';

  if (!apiKey || !text || !text.trim()) {
    return NextResponse.json({ translatedText: '' }, { status: 200 });
  }

  const prompt = `Translate the following text from ${from || 'auto-detected'} to ${to}. Respond with ONLY the translation, no quotes, no additional commentary.\n\n${text}`;

  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise translation engine.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translatedText: string = (data?.choices?.[0]?.message?.content ?? '').trim();
    return NextResponse.json({ translatedText }, { status: 200 });
  } catch {
    return NextResponse.json({ translatedText: '' }, { status: 200 });
  }
}


