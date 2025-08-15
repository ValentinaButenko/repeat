"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getParentPath(pathname: string): string | null {
  if (pathname === '/home' || pathname === '/' || pathname.startsWith('/onboarding')) return null;
  if (pathname.startsWith('/sets/')) return '/home';
  if (pathname.startsWith('/study/')) return '/home';
  if (pathname.startsWith('/settings')) return '/home';
  return '/home';
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parent = getParentPath(pathname);
  if (!parent) return null;

  const isOneDeep = parent === '/home';
  const label = isOneDeep ? 'Back' : 'Home';

  return (
    <div className="mb-2">
      <Link href={parent} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        <span aria-hidden>←</span>
        <span>{label}</span>
      </Link>
    </div>
  );
}


