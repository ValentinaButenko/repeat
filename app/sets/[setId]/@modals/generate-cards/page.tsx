"use client";
import { useRouter, useParams } from 'next/navigation';
import CardGenerationModal from '../../../../../components/CardGenerationModal';

export default function GenerateCardsModal() {
  const router = useRouter();
  const params = useParams<{ setId: string }>();

  function onGenerated() {
    // Trigger a custom event to refresh the set page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: params.setId } }));
    }
  }

  return (
    <CardGenerationModal
      setId={params.setId}
      onGenerated={onGenerated}
    />
  );
}
