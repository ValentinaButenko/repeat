"use client";
import { useEffect, useState } from 'react';
import { translate } from '../lib/translation';
import { UserSettingsRepo } from '../repo/userSettings';
import { languageToCode } from '../lib/languages';
import SetPicker from './SetPicker';
import { normalizeFront } from '../repo/normalize';
import { CardRepo, safeCreateCard } from '../repo/cards';
import type { UUID, Card } from '../db/types';

interface Props {
  initial?: Partial<Card> & { setId?: UUID };
  mode: 'create' | 'edit';
  onSaved: (card: Card) => void;
  hideSetPicker?: boolean;
  fixedSetId?: UUID;
  resetOnSave?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
}

export default function CardForm({ initial, mode, onSaved, hideSetPicker, fixedSetId, resetOnSave, onCancel, cancelLabel = 'Cancel' }: Props) {
  const [setId, setSetId] = useState<UUID | undefined>(fixedSetId ?? initial?.setId);
  const [front, setFront] = useState(initial?.front ?? '');
  const [back, setBack] = useState(initial?.back ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [frontInputEl, setFrontInputEl] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    setError(null);
  }, [setId, front]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.platform || '';
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
    }
  }, []);

  async function autoTranslate() {
    setLoading(true);
    setError(null);
    setCandidates(null);
    try {
      const settings = await UserSettingsRepo.get();
      const to = languageToCode(settings?.nativeLanguage) ?? 'en';
      const from = languageToCode(settings?.learningLanguage) ?? 'auto';
      const translated = await translate(front, from, to);
      if (translated && typeof translated === 'string') {
        // Allow comma/semicolon separated suggestions if backend returns like that
        const parts = String(translated).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          setCandidates(parts);
          setBack(parts[0]);
        } else {
          setBack(translated);
        }
      } else {
        setError('NO_TRANSLATION');
      }
    } catch {
      setError('NO_TRANSLATION');
    } finally {
      setLoading(false);
    }
  }

  async function createCard() {
    if (!setId) {
      setError('Please choose a set');
      return;
    }
    const nf = normalizeFront(front);
    if (await CardRepo.existsInSet(setId, nf)) {
      setError('A card with this front already exists in the selected set.');
      return;
    }
    try {
      const saved = await safeCreateCard(setId, front, back);
      // notify listeners (e.g., underlying set page) to refresh immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId } }));
      }
      onSaved(saved);
      if (resetOnSave) {
        setFront('');
        setBack('');
      }
      // Focus/select learn input for rapid entry
      setTimeout(() => {
        if (frontInputEl) {
          frontInputEl.focus();
          try { frontInputEl.select(); } catch {}
        }
      }, 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save card';
      setError(message);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCard();
  }

  // trigger translation as soon as user typed 2+ chars
  useEffect(() => {
    if (front.trim().length >= 2) {
      const id = setTimeout(() => autoTranslate(), 400);
      return () => clearTimeout(id);
    }
  }, [front]);

  function onKeyDown(e: React.KeyboardEvent) {
    if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === 'Enter')) {
      e.preventDefault();
      void createCard();
    }
  }

  return (
    <form onSubmit={onSubmit} onKeyDown={onKeyDown} className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              placeholder="Write new word"
              className="input"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
              ref={setFrontInputEl}
            />
          </div>
          {!hideSetPicker && (
            <div className="w-1/3">
              <SetPicker value={setId} onChange={(v) => setSetId(v)} />
            </div>
          )}
        </div>
      </div>
      {/* Translation area */}
      <div className="mt-8 flex items-center justify-between" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 24 }}>
        <div className="flex items-center gap-4">
          <span style={{ color: error ? '#BBBBB9' : loading ? '#BBBBB9' : back ? '#1C1D17' : '#BBBBB9' }}>
            {loading ? 'Translating' : error ? 'No translation found' : back ? back : 'Translation appears here'}
          </span>
          {loading && (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#1C1D17" strokeWidth="3" fill="none" opacity="0.2" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="#1C1D17" strokeWidth="3" fill="none" />
            </svg>
          )}
        </div>
        {error && (
          <button type="button" className="btn-secondary" onClick={autoTranslate}>
            <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="80 88 48 88 48 56" />
              <path d="M48 88a88 88 0 1 0 26-62" />
            </svg>
            <span>Try again</span>
          </button>
        )}
      </div>
      {candidates && candidates.length > 1 && (
        <div className="flex flex-col gap-6 mt-4">
          {candidates.map((c, i) => (
            <button key={i} type="button" className="text-left" onClick={() => setBack(c)} style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 20, color: '#1C1D17' }}>
              {c}
            </button>
          ))}
        </div>
      )}
      {/* Manual back input: appears only when translation not found */}
      {error && (
        <textarea
          className="input"
          placeholder="Add manually"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          style={{ height: 140, padding: 20 }}
        />
      )}
      <div className="flex gap-2 justify-end mt-auto">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            <span>Close</span>
            <span style={{ color: '#A4A5A2' }}>Esc</span>
          </button>
        )}
        <button type="submit" className="btn-primary" style={{ width: 200, height: 52 }}>
          {mode === 'create' ? (
            <>
              <span>Create</span>
              <span style={{ color: '#F6F4F0', opacity: 0.6 }}>{isMac ? '⌘ + ↵' : 'Ctrl + ↵'}</span>
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}


