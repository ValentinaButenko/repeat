"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES, LANGUAGE_OPTIONS } from '../lib/languages';
import { UserSettingsRepo } from '../repo/userSettings';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (newLanguage: string) => void;
  type: 'learning' | 'native';
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, type }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      if (type === 'learning') {
        await UserSettingsRepo.save({ learningLanguage: languageCode });
      } else {
        await UserSettingsRepo.save({ nativeLanguage: languageCode });
      }
      onLanguageChange(languageCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          font-bitter font-medium text-base text-[#1C1D17]
          bg-[#E8E2D9] rounded-lg
          py-2 px-5
          border border-[#D2D2D1]
          transition-colors duration-200
          hover:border-[#BBBBB9]
          focus:outline-none focus:ring-2 focus:ring-[#BBBBB9] focus:ring-opacity-50
          ${isOpen ? 'border-[#BBBBB9]' : ''}
        `}
        style={{ fontFamily: 'var(--font-bitter)' }}
      >
        {LANGUAGES[currentLanguage] || currentLanguage}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#D2D2D1] z-50 max-h-60 overflow-y-auto">
          {LANGUAGE_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className={`
                w-full text-left px-4 py-2 text-sm font-medium
                hover:bg-[#E8E2D9] transition-colors duration-150
                ${code === currentLanguage ? 'bg-[#E8E2D9] text-[#1C1D17]' : 'text-[#1C1D17]'}
                first:rounded-t-lg last:rounded-b-lg
              `}
              style={{ fontFamily: 'var(--font-bitter)' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
