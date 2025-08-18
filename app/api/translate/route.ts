import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text, from, to } = await req.json().catch(() => ({ text: '', from: 'auto', to: 'EN' }));
  if (!text || !text.trim()) return NextResponse.json({ translatedText: '' }, { status: 200 });

  // Try OpenAI first if configured
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const out = await translateWithOpenAI(text, from, to, openaiKey);
    if (out) return NextResponse.json({ translatedText: out, provider: 'openai' }, { status: 200 });
  }

  // Then DeepL if configured
  const deeplKey = process.env.DEEPL_API_KEY || process.env.NEXT_PUBLIC_DEEPL_API_KEY;
  if (deeplKey) {
    const out = await translateWithDeepL(text, from, to, deeplKey);
    if (out) return NextResponse.json({ translatedText: out, provider: 'deepl' }, { status: 200 });
  }

  // Finally LibreTranslate
  const libreBase = process.env.TRANSLATE_BASE_URL || process.env.NEXT_PUBLIC_TRANSLATE_BASE_URL || 'https://libretranslate.com';
  const out = await translateWithLibre(text, from, to, libreBase);
  return NextResponse.json({ translatedText: out, provider: 'libre' }, { status: 200 });
}

async function translateWithOpenAI(text: string, from: string, to: string, key: string): Promise<string> {
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini';
  const prompt = `Translate the following text from ${from || 'auto-detected'} to ${to}. Respond with ONLY the translation, no quotes, no additional commentary.\n\n${text}`;
  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
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
    if (!res.ok) throw new Error('openai');
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? '').trim();
  } catch { return ''; }
}

async function translateWithDeepL(text: string, from: string, to: string, key: string): Promise<string> {
  const base = process.env.DEEPL_API_BASE_URL || process.env.NEXT_PUBLIC_DEEPL_API_BASE_URL || 'https://api-free.deepl.com';
  const url = base.replace(/\/$/, '') + '/v2/translate';
  const params = new URLSearchParams();
  params.set('text', text);
  params.set('target_lang', mapToDeepLLang(to, true) ?? 'EN');
  const src = mapToDeepLLang(from, false);
  if (src) params.set('source_lang', src);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) throw new Error('deepl');
    const data = await res.json();
    return String(data?.translations?.[0]?.text ?? '');
  } catch { return ''; }
}

async function translateWithLibre(text: string, from: string, to: string, baseUrl: string): Promise<string> {
  const url = baseUrl.replace(/\/$/, '') + '/translate';
  const body = { q: text, source: from || 'auto', target: to || 'en', format: 'text' } as const;
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('libre');
    const data = await res.json();
    return String(data?.translatedText ?? data?.translation ?? '');
  } catch { return ''; }
}

function mapToDeepLLang(code: string, isTarget: boolean): string | undefined {
  if (!code || code.toLowerCase() === 'auto') return undefined;
  const c = code.toLowerCase();
  if (c === 'en') return 'EN';
  if (c === 'pt') return isTarget ? 'PT-PT' : 'PT';
  if (c === 'zh' || c === 'zh-cn') return 'ZH';
  return c.toUpperCase();
}


