"use client";
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppModal from '../../../../../components/AppModal';
import CardForm from '../../../../../components/CardForm';
import type { UUID } from '../../../../../db/types';

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const setId = params.get('setId') ?? undefined;
  function onSaved() { /* keep modal open until user closes manually */ }
  return (
    <AppModal title="New card">
      <div className="flex flex-col gap-6 h-full">
        <CardForm
          mode="create"
          onSaved={onSaved}
          onCancel={() => router.back()}
          cancelLabel="Close"
          initial={{ setId: setId as unknown as UUID }}
          resetOnSave={true}
        />
      </div>
    </AppModal>
  );
}

export default function NewCardModal() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}


