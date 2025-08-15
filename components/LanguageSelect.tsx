"use client";
import { LANGUAGE_OPTIONS } from '../lib/languages';
import { clsx } from 'clsx';

interface Props {
  label: string;
  value: string;
  onChange: (code: string) => void;
  id?: string;
}

export default function LanguageSelect({ label, value, onChange, id }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      <select
        id={id}
        className={clsx(
          'rounded-md border border-gray-300 px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}


