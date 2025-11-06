export const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  uk: 'Ukrainian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

export const LANGUAGE_OPTIONS = Object.entries(LANGUAGES).map(([code, label]) => ({ code, label }));

export function languageToCode(input?: string | null): string | undefined {
  if (!input) return undefined;
  const v = String(input).trim();
  if (!v) return undefined;
  const lower = v.toLowerCase();
  // already a known code
  if (LANGUAGES[lower]) return lower;
  // try match by label
  for (const [code, label] of Object.entries(LANGUAGES)) {
    if (label.toLowerCase() === lower) return code;
  }
  // 2-letter guess
  if (/^[a-z]{2}$/i.test(v)) return lower;
  return undefined;
}


