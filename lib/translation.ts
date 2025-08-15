const DEFAULT_BASE = process.env.NEXT_PUBLIC_TRANSLATE_BASE_URL || 'https://libretranslate.com';

export async function translate(text: string, from: string, to: string, baseUrl: string = DEFAULT_BASE): Promise<string> {
  if (!text.trim()) return '';
  const url = `${baseUrl.replace(/\/$/, '')}/translate`;
  const body = { q: text, source: from, target: to, format: 'text' } as const;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data.translatedText ?? data.translation ?? '';
    return String(v);
  } catch (e) {
    // retry once after a small delay
    await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const v = data.translatedText ?? data.translation ?? '';
      return String(v);
    } catch {
      return '';
    }
  }
}


