"use client";
import { useEffect, useMemo, useState } from 'react';
import { SetRepo } from '../repo/sets';
import type { CardSet, UUID } from '../db/types';

interface Props {
  value?: UUID;
  onChange: (setId: UUID) => void;
}

export default function SetPicker({ value, onChange }: Props) {
  const [sets, setSets] = useState<CardSet[]>([]);

  useEffect(() => {
    SetRepo.list().then((arr) => {
      setSets(arr);
      // default to last created set if none selected
      if (!value && arr.length) onChange(arr[0].id);
    });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          className="select pr-14"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value as UUID)}
        >
          {sets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-3 text-[#5B5B55]" style={{ fontFamily: 'var(--font-bitter)', fontSize: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {/* card count will be shown by parent if needed */}
        </div>
      </div>
    </div>
  );
}


