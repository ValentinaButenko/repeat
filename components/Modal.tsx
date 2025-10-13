"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Modal({ title, children, className, titleClassName, titleStyle }: { title: string; children: React.ReactNode; className?: string; titleClassName?: string; titleStyle?: React.CSSProperties }) {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        router.back();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={(className ?? "bg-white rounded-lg shadow-lg max-w-lg w-full p-4") + " flex flex-col"}>
        {title && (
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className={titleClassName ?? "font-semibold"} style={titleStyle}>{title}</h2>
            <button aria-label="Close" onClick={() => router.back()} className="text-gray-700">✕</button>
          </div>
        )}
        {!title && (
          <div className="absolute top-4 right-4">
            <button aria-label="Close" onClick={() => router.back()} className="text-gray-700">✕</button>
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}


