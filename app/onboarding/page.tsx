"use client";
import { useEffect, useState } from 'react';
import LanguageSelect from '../../components/LanguageSelect';
import { UserSettingsRepo } from '../../repo/userSettings';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [learning, setLearning] = useState('es');
  const [native, setNative] = useState('en');
  const router = useRouter();

  useEffect(() => {
    UserSettingsRepo.get().then((s) => {
      if (s) router.replace('/home');
    });
  }, [router]);

  async function save() {
    await UserSettingsRepo.save({ learningLanguage: learning, nativeLanguage: native });
    router.replace('/home');
  }

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Welcome! Pick your languages</h1>
      <LanguageSelect label="Learning language" value={learning} onChange={setLearning} />
      <LanguageSelect label="Native language" value={native} onChange={setNative} />
      <button onClick={save} className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm w-fit">Continue</button>
    </div>
  );
}


