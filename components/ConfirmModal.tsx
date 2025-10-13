"use client";
import { useEffect } from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onConfirm();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onConfirm, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[540px] h-[340px] bg-[#F6F4F0] rounded-lg p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="font-bitter font-bold text-2xl" style={{ color: '#1C1D17' }}>
            {title}
          </h2>
          <button 
            aria-label="Close" 
            onClick={onCancel} 
            className="text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col gap-6">
              <div 
                className="text-[#1C1D17]" 
                style={{ 
                  fontFamily: 'var(--font-bitter)', 
                  fontWeight: 400, 
                  fontSize: 16,
                  lineHeight: '1.5'
                }}
              >
                {message}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="btn-secondary">
                {cancelText}
                <span className="ml-2 opacity-60" style={{ color: '#1C1D17' }}>Esc</span>
              </button>
              <button 
                onClick={onConfirm} 
                className={`btn-primary ${isDestructive ? 'bg-[#EE683F] hover:bg-[#d55a35]' : ''}`}
              >
                {confirmText}
                <span className="ml-2 opacity-60" style={{ color: '#F6F4F0' }}>⌘ + ↵</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
