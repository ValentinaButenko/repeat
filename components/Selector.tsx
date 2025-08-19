"use client";

import React from 'react';

interface SelectorProps {
  title: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function Selector({ title, onClick, isSelected = false }: SelectorProps) {
  return (
    <button
      onClick={onClick}
      className={`
        font-bitter font-medium text-lg text-[#1C1D17]
        bg-[#E8E2D9] rounded-lg
        w-18 py-2 px-5
        border border-[#D2D2D1]
        transition-colors duration-200
        hover:border-[#BBBBB9]
        focus:outline-none focus:ring-2 focus:ring-[#BBBBB9] focus:ring-opacity-50
        ${isSelected ? 'border-[#BBBBB9]' : ''}
      `}
      style={{ fontFamily: 'var(--font-bitter)' }}
    >
      {title}
    </button>
  );
}
