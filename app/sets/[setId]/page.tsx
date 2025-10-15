"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../db';
import type { Card, CardSet } from '../../../db/types';
import Breadcrumbs from '../../../components/Breadcrumbs';
import IconButton from '../../../components/IconButton';
import ConfirmModal from '../../../components/ConfirmModal';
import { CardRepo } from '../../../repo/cards';
import { Plus, MagicWand, TrashSimple, Play } from '@phosphor-icons/react';

interface CardComponentProps {
  card: Card;
  setId: string;
  onDelete: (cardId: string, cardFront: string) => void;
}

function CardComponent({ card, setId, onDelete }: CardComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/sets/${setId}/edit-card/${card.id}`);
  };

  const handleDeleteClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onDelete(card.id, card.front);
  };

  return (
    <div
      className="relative rounded-xl p-4 transition-all bg-white/30 hover:bg-white/45 active:translate-y-px cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 600, fontSize: 18 }}>
        {card.front}
      </div>
      <div className="mt-1 text-[#5B5B55]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 14 }}>
        {card.back}
      </div>
      <div 
        className="absolute top-2 right-2"
        onClick={handleDeleteClick}
      >
        <IconButton
          onClick={handleDeleteClick}
          aria-label={`Delete card "${card.front}"`}
          visible={isHovered}
        >
          <TrashSimple size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default function SetDetails() {
  const params = useParams<{ setId: string }>();
  const search = useSearchParams();
  const [set, setSet] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [query, setQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ cardId: string; cardFront: string } | null>(null);

  async function load() {
    const id = params.setId;
    const s = await db.sets.get(id);
    const cs = await db.cards.where('setId').equals(id).toArray();
    setSet(s ?? null);
    setCards(cs);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.setId, search.get('ts')]);

  useEffect(() => {
    function onChanged(e: Event) {
      // refresh if change is for this set
      const detail = (e as CustomEvent<{ setId: string }>).detail;
      if (!detail || detail.setId !== params.setId) return;
      load();
    }
    window.addEventListener('cards:changed', onChanged as EventListener);
    return () => window.removeEventListener('cards:changed', onChanged as EventListener);
  }, [params.setId]);

  function handleDeleteCard(cardId: string, cardFront: string) {
    setDeleteConfirm({ cardId, cardFront });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    
    try {
      await CardRepo.remove(deleteConfirm.cardId);
      // Refresh the cards list
      await load();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
      setDeleteConfirm(null);
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null);
  }

  if (!set) return <div className="p-6">Set not found.</div>;
  const setId = params.setId;
  const filtered = cards.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.front.toLowerCase().includes(q) || (c.back ?? '').toLowerCase().includes(q);
  });
  return (
    <div className="mx-auto pt-[72px] max-w-[1280px] flex flex-col gap-6">
      <Breadcrumbs />
      
      {/* Title and Study button row */}
      <div className="flex items-center justify-between mt-1">
        <h1 className="m-0">{set.name}</h1>
        {cards.length > 0 && (
          <Link href={`/study/${setId}?restart=1`} className="btn-primary" style={{ width: 'auto', paddingLeft: '24px', paddingRight: '24px' }}>
            <span>Study</span>
            <Play size={20} weight="fill" />
          </Link>
        )}
      </div>

      {/* Search and action buttons row */}
      {cards.length > 0 && (
        <div className="flex items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <style jsx>{`
              .search-input::placeholder {
                color: #60615D !important;
              }
              .search-input:focus,
              .search-input:active {
                outline: none !important;
                border: none !important;
                box-shadow: none !important;
              }
            `}</style>
            <input
              className="input border-none outline-none search-input"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                paddingLeft: '40px', 
                background: 'transparent', 
                color: '#60615D'
              }}
              onFocus={(e) => e.target.style.outline = 'none'}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#60615D' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" strokeWidth="1.8" />
              </svg>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link href={`/sets/${setId}/new-card`} className="btn-secondary">
              <Plus size={20} />
              <span>Add card</span>
            </Link>
            <Link href={`/sets/${setId}/generate-cards`} className="btn-secondary">
              <MagicWand size={20} />
              <span>Generate cards</span>
            </Link>
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        // Empty state when no cards exist
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
          <h2 
            className="text-[#60615D] text-[38px] m-0"
            style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400 }}
          >
            No cards in this set
          </h2>
          <div className="flex items-center gap-4">
            <Link href={`/sets/${setId}/new-card`} className="btn-secondary">
              <Plus size={20} />
              <span>Add card</span>
            </Link>
            <Link href={`/sets/${setId}/generate-cards`} className="btn-primary">
              <MagicWand size={20} />
              <span>Generate cards</span>
            </Link>
          </div>
        </div>
      ) : (
        // Normal state when cards exist
        <>
          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="mt-6 text-sm text-gray-600">No matching cards.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <CardComponent
                  key={c.id}
                  card={c}
                  setId={setId}
                  onDelete={handleDeleteCard}
                />
              ))}
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete card"
          message={`Are you sure you want to delete "${deleteConfirm.cardFront}"?`}
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


