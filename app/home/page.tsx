"use client";
import Link from 'next/link';
import Heatmap from '../../components/Heatmap';
import { db } from '../../db';
import { useEffect, useState } from 'react';
import type { CardSet } from '../../db/types';
import { SetRepo } from '../../repo/sets';
import { UserSettingsRepo } from '../../repo/userSettings';
import { useRouter } from 'next/navigation';
import LanguageSelector from '../../components/LanguageSelector';
import IconButton from '../../components/IconButton';
import ConfirmModal from '../../components/ConfirmModal';
import { ArrowRight, StackPlus, Plus, TrashSimple } from '@phosphor-icons/react';

interface SetCardProps {
  set: CardSet;
  count: number;
  onDelete: (setId: string, setName: string) => void;
}

function SetCard({ set, count, onDelete }: SetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/sets/${set.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(set.id, set.name);
  };

  return (
    <div
      className="relative rounded-xl p-4 transition-all bg-white/30 hover:bg-white/45 active:translate-y-px cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div style={{ fontFamily: 'var(--font-bitter)', fontWeight: 600, fontSize: 18, color: '#1C1D17' }}>
        {set.name}
      </div>
      <div className="mt-3" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 14, color: '#5B5B55' }}>
        {(() => {
          if (count === 0) return 'No cards';
          if (count === 1) return '1 card';
          return `${count} cards`;
        })()}
      </div>
      <div 
        className="absolute top-2 right-2"
        onClick={handleDeleteClick}
      >
        <IconButton
          onClick={handleDeleteClick}
          aria-label={`Delete set "${set.name}"`}
          visible={isHovered}
        >
          <TrashSimple size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [sets, setSets] = useState<CardSet[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lastSetId, setLastSetId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<{ learningLanguage: string; nativeLanguage: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ setId: string; setName: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    SetRepo.list().then((s) => mounted && setSets(s));
    const interval = setInterval(() => {
      SetRepo.list().then((s) => mounted && setSets(s));
    }, 500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    UserSettingsRepo.get().then((s) => {
      if (mounted) {
        setLastSetId(s?.lastStudiedSetId ?? null);
        setUserSettings(s ? { learningLanguage: s.learningLanguage, nativeLanguage: s.nativeLanguage } : null);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let canceled = false;
    async function loadCounts() {
      const entries = await Promise.all(
        sets.map(async (s) => {
          const c = await db.cards.where('setId').equals(s.id).count();
          return [s.id, c] as const;
        })
      );
      if (!canceled) {
        const map: Record<string, number> = {};
        for (const [id, c] of entries) map[id] = c;
        setCounts(map);
      }
    }
    if (sets.length) loadCounts();
    return () => {
      canceled = true;
    };
  }, [sets]);

  function handleDeleteSet(setId: string, setName: string) {
    setDeleteConfirm({ setId, setName });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    
    try {
      await SetRepo.remove(deleteConfirm.setId);
      // Refresh the sets list
      const updatedSets = await SetRepo.list();
      setSets(updatedSets);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete set:', error);
      alert('Failed to delete set. Please try again.');
      setDeleteConfirm(null);
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null);
  }
  return (
    <div className="w-full pt-[72px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Repeat</h1>
          <p className="subtitle mt-2">Let's repeat some words today.</p>
        </div>
        {userSettings && (
          <div className="flex items-center gap-2">
            <LanguageSelector 
              currentLanguage={userSettings.learningLanguage}
              onLanguageChange={(newLanguage) => setUserSettings(prev => prev ? { ...prev, learningLanguage: newLanguage } : null)}
              type="learning"
            />
            <ArrowRight size={24} color="#1C1D17" weight="regular" />
            <LanguageSelector 
              currentLanguage={userSettings.nativeLanguage}
              onLanguageChange={(newLanguage) => setUserSettings(prev => prev ? { ...prev, nativeLanguage: newLanguage } : null)}
              type="native"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.3)' }}>
        <div className="p-6 flex items-start justify-between gap-6">
          <div className="w-1/2">
            <div className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 14 }}>
              “ What you do every day matters more than what you do once in a while ”
            </div>
            <div className="mt-2 text-[#1C1D17] italic" style={{ fontFamily: 'var(--font-bitter)', fontSize: 12 }}>
              - Gretchen Rubin
            </div>
            <div className="mt-4">
              <button
                className="btn-primary"
                onClick={() => {
                  if (lastSetId) router.push(`/study/${lastSetId}?restart=1`);
                  else router.push('/study/all');
                }}
              >
                <span>Study</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden ml-6">
            <div className="flex items-start justify-end">
              <div className="scale-110 origin-top-right">
                <Heatmap columns={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between mb-2">
          <h2 style={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}>My library</h2>
          <div className="flex items-center gap-2">
            <Link href="/home/new-card" className="btn-secondary">
              <Plus size={20} />
              <span>Add card</span>
            </Link>
            <Link href="/home/new-set" className="btn-secondary">
              <StackPlus size={20} />
              <span>Add set</span>
            </Link>
          </div>
        </div>
        {sets.length === 0 ? (
          <div className="mt-6 text-sm text-gray-600">No sets yet. Create one to get started.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((s) => (
              <SetCard
                key={s.id}
                set={s}
                count={counts[s.id] ?? 0}
                onDelete={handleDeleteSet}
              />
            ))}
          </div>
        )}
      </div>
      
      {deleteConfirm && (
        <ConfirmModal
          title="Delete set"
          message={`Are you sure you want to delete "${deleteConfirm.setName}"? This will also delete all cards in this set.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDestructive={true}
        />
      )}
    </div>
  );
}


