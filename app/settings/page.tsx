"use client";
import { useEffect, useState } from 'react';
import LanguageSelect from '../../components/LanguageSelect';
import { UserSettingsRepo } from '../../repo/userSettings';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function SettingsPage() {
  const [learning, setLearning] = useState('es');
  const [native, setNative] = useState('en');
  const [baseUrl, setBaseUrl] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    UserSettingsRepo.get().then((s) => {
      if (s) {
        setLearning(s.learningLanguage);
        setNative(s.nativeLanguage);
        setBaseUrl(s.translationApiBaseUrl ?? '');
      }
      setLoaded(true);
    });
  }, []);

  async function save() {
    await UserSettingsRepo.save({ learningLanguage: learning, nativeLanguage: native, translationApiBaseUrl: baseUrl || undefined });
    alert('Saved');
  }

  if (!loaded) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-4">
      <Breadcrumbs />
      <h1 className="text-xl font-semibold">Settings</h1>
      <LanguageSelect label="Learning language" value={learning} onChange={setLearning} />
      <LanguageSelect label="Native language" value={native} onChange={setNative} />
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Translation API base URL</span>
        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://libretranslate.com" />
      </label>
      <div className="flex justify-end">
        <button onClick={save} className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm">Save</button>
      </div>
    </div>
  );
}


