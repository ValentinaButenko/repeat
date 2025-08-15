"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSettingsRepo } from '../repo/userSettings';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const settings = await UserSettingsRepo.get();
      router.replace(settings ? '/home' : '/onboarding');
    })();
  }, [router]);
  return <div className="p-6 text-sm text-gray-600">Loading…</div>;
}
