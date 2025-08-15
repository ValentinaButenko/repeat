"use client";
import { useRouter, useParams } from 'next/navigation';
import Modal from '../../../../../components/Modal';
import CardForm from '../../../../../components/CardForm';
import type { UUID } from '../../../../../db/types';

export default function NewCardInSet() {
  const router = useRouter();
  const params = useParams<{ setId: string }>();
  function onSaved() {
    // stay on modal and keep adding; set page will refresh when closing
  }
  return (
    <Modal title="New card" className="rounded-xl w-full max-w-[680px] h-[540px] overflow-auto bg-[#F6F4F0] p-8" titleClassName="text-[#1C1D17]" titleStyle={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}>
      <div className="flex flex-col gap-6 h-full">
        <CardForm
          mode="create"
          onSaved={onSaved}
          onCancel={() => router.back()}
          hideSetPicker
          fixedSetId={params.setId as unknown as UUID}
          resetOnSave
          cancelLabel="Close"
          initial={{ setId: params.setId as unknown as UUID }}
        />
      </div>
    </Modal>
  );
}


