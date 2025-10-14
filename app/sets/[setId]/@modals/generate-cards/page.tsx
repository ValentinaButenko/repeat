"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import CardGenerationModal from '../../../../../components/CardGenerationModal';
import { db } from '../../../../../db';
import type { CardSet } from '../../../../../db/types';

export default function GenerateCardsModal() {
  const params = useParams<{ setId: string }>();
  const [set, setSet] = useState<CardSet | null>(null);

  useEffect(() => {
    if (params.setId) {
      db.sets.get(params.setId).then((s) => {
        if (s) setSet(s);
      });
    }
  }, [params.setId]);

  function onGenerated() {
    // Trigger a custom event to refresh the set page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: params.setId } }));
    }
  }

  if (!set) {
    return <div>Loading...</div>;
  }

  return (
    <CardGenerationModal
      setId={params.setId}
      setName={set.name}
      onGenerated={onGenerated}
    />
  );
}
