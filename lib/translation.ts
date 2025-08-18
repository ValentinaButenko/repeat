const LIBRE_BASE = process.env.NEXT_PUBLIC_TRANSLATE_BASE_URL || 'https://libretranslate.com';
const DEEPL_BASE = process.env.NEXT_PUBLIC_DEEPL_API_BASE_URL || 'https://api-free.deepl.com';
const DEEPL_KEY = process.env.NEXT_PUBLIC_DEEPL_API_KEY;

export async function translate(text: string, from: string, to: string, baseUrl: string = LIBRE_BASE): Promise<string> {
  if (!text.trim()) return '';

  // Prefer DeepL if API key is configured
  if (DEEPL_KEY) {
    return translateWithDeepL(text, from, to);
  }

  return translateWithLibre(text, from, to, baseUrl);
}

async function translateWithLibre(text: string, from: string, to: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, '')}/translate`;
  const body = { q: text, source: from, target: to, format: 'text' } as const;
  const attempt = async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data.translatedText ?? data.translation ?? '';
    return String(v);
  };
  try {
    return await attempt();
  } catch {
    await new Promise((r) => setTimeout(r, 400));
    try { return await attempt(); } catch { return ''; }
  }
}

function mapToDeepLLang(code: string, isTarget: boolean): string | undefined {
  if (!code || code.toLowerCase() === 'auto') return undefined; // let DeepL auto-detect
  const c = code.toLowerCase();
  // Common mappings; fallback to upper-case 2-letter code
  if (c === 'en') return 'EN';
  if (c === 'pt') return isTarget ? 'PT-PT' : 'PT';
  if (c === 'zh' || c === 'zh-cn') return 'ZH';
  return c.toUpperCase();
}

async function translateWithDeepL(text: string, from: string, to: string): Promise<string> {
  const url = `${DEEPL_BASE.replace(/\/$/, '')}/v2/translate`;
  const params = new URLSearchParams();
  params.set('text', text);
  const target = mapToDeepLLang(to, true) ?? 'EN';
  params.set('target_lang', target);
  const source = mapToDeepLLang(from, false);
  if (source) params.set('source_lang', source);

  const attempt = async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const textOut = data?.translations?.[0]?.text ?? '';
    return String(textOut);
  };
  try {
    return await attempt();
  } catch {
    await new Promise((r) => setTimeout(r, 400));
    try { return await attempt(); } catch { return ''; }
  }
}


