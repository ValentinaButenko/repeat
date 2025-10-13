"use client";
import { useEffect, useState, useRef } from 'react';
import { SetRepo } from '../repo/sets';
import { db } from '../db';
import type { CardSet, UUID } from '../db/types';

interface Props {
  value?: UUID;
  onChange: (setId: UUID) => void;
}

export default function SetPicker({ value, onChange }: Props) {
  const [sets, setSets] = useState<CardSet[]>([]);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SetRepo.list().then((arr) => {
      setSets(arr);
      // default to last created set if none selected
      if (!value && arr.length) onChange(arr[0].id);
    });
  }, []);

  useEffect(() => {
    async function loadCounts() {
      const counts: Record<string, number> = {};
      for (const set of sets) {
        const count = await db.cards.where('setId').equals(set.id).count();
        counts[set.id] = count;
      }
      setCardCounts(counts);
    }
    if (sets.length) loadCounts();
  }, [sets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSet = sets.find((s) => s.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full font-bitter font-medium text-base text-[#1C1D17]
          bg-transparent rounded-lg
          border border-[#E8E2D9]
          transition-colors duration-200
          hover:border-[#1C1D17]
          focus:outline-none focus:border-[#1C1D17]
          ${isOpen ? 'border-[#1C1D17]' : ''}
          text-left
        `}
        style={{ fontFamily: 'var(--font-bitter)', height: '52px', padding: '0 20px', fontSize: '18px' }}
      >
        <div className="flex items-center justify-between">
          <span>{selectedSet?.name || 'Select a set'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#D2D2D1] z-50 max-h-60 overflow-y-auto">
          {sets.map((set) => (
            <button
              key={set.id}
              type="button"
              onClick={() => {
                onChange(set.id);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm font-medium
                hover:bg-[#E8E2D9] transition-colors duration-150
                ${set.id === value ? 'bg-[#E8E2D9] text-[#1C1D17]' : 'text-[#1C1D17]'}
                first:rounded-t-lg last:rounded-b-lg
                flex items-center justify-between
              `}
              style={{ fontFamily: 'var(--font-bitter)' }}
            >
              <span>{set.name}</span>
              <span className="text-[#5B5B55] text-xs">
                {cardCounts[set.id] !== undefined ? `${cardCounts[set.id]} ${cardCounts[set.id] === 1 ? 'card' : 'cards'}` : '...'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


