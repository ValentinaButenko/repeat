"use client";
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '../../../../../components/Modal';
import CardForm from '../../../../../components/CardForm';
import type { UUID } from '../../../../../db/types';

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const setId = params.get('setId') ?? undefined;
  function onSaved() { /* keep modal open until user closes manually */ }
  return (
    <Modal
      title="New card"
      className="rounded-xl w-full max-w-[680px] h-[540px] overflow-auto bg-[#F6F4F0] p-8"
      titleClassName="text-[#1C1D17]"
      titleStyle={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}
    >
      <div className="flex flex-col gap-6 h-full">
        <CardForm
          mode="create"
          onSaved={onSaved}
          onCancel={() => router.back()}
          cancelLabel="Close"
          initial={{ setId: setId as unknown as UUID }}
        />
      </div>
    </Modal>
  );
}

export default function NewCardModal() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}


