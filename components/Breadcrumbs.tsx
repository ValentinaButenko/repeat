"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../db';
import type { CardSet } from '../db/types';

function getParentPath(pathname: string): string | null {
  if (pathname === '/home' || pathname === '/' || pathname.startsWith('/onboarding')) return null;
  if (pathname.startsWith('/sets/')) return '/home';
  if (pathname.startsWith('/study/')) return '/home';
  if (pathname.startsWith('/settings')) return '/home';
  return '/home';
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const [setName, setSetName] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);

  // Detect /study/{setId} specifically for richer breadcrumbs
  useEffect(() => {
    const m = pathname?.match(/^\/study\/([a-f0-9-]+)/i);
    if (m && m[1]) {
      const id = m[1];
      setSetId(id);
      db.sets.get(id).then((s: CardSet | undefined) => setSetName(s?.name ?? null));
    } else {
      setSetId(null);
      setSetName(null);
    }
  }, [pathname]);

  if (setId) {
    return (
      <div className="mb-2">
        <nav className="flex items-center gap-2 text-[#1C1D17]" aria-label="Breadcrumb">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-[18px] font-medium font-[var(--font-bitter)] no-underline hover:opacity-80 active:opacity-60"
          >
            Home
          </Link>
          <span aria-hidden className="text-[#8D8E8B]">/</span>
          <Link
            href={`/sets/${setId}`}
            className="inline-flex items-center gap-2 text-[18px] font-medium font-[var(--font-bitter)] no-underline hover:opacity-80 active:opacity-60"
          >
            {setName ?? 'Set'}
          </Link>
          <span aria-hidden className="text-[#8D8E8B]">/</span>
          <span className="text-[18px] font-medium font-[var(--font-bitter)] text-[#1C1D17]">Study cards</span>
        </nav>
      </div>
    );
  }

  const parent = getParentPath(pathname);
  if (!parent) return null;

  const isOneDeep = parent === '/home';
  const label = isOneDeep ? 'Back' : 'Home';

  return (
    <div className="mb-2">
      <Link
        href={parent}
        className="inline-flex items-center gap-2 text-[18px] font-medium text-[#1C1D17] font-[var(--font-bitter)] no-underline hover:opacity-80 active:opacity-60"
      >
        <span aria-hidden>←</span>
        <span>{label}</span>
      </Link>
    </div>
  );
}


