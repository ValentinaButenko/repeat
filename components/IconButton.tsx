"use client";
import { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  visible?: boolean;
}

export default function IconButton({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  'aria-label': ariaLabel,
  visible = true
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        w-10 h-10 
        flex items-center justify-center
        bg-transparent
        border-none
        cursor-pointer
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{
        color: '#8D8E8B'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = '#494A45';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = '#8D8E8B';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = '#1C1D17';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = '#494A45';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = '#8D8E8B';
        }
      }}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {children}
      </div>
    </button>
  );
}
