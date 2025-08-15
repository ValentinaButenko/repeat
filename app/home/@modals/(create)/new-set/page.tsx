"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../../../../components/Modal';
import { SetRepo } from '../../../../../repo/sets';

export default function NewSetModal() {
  const [name, setName] = useState('');
  const router = useRouter();

  async function create() {
    if (!name.trim()) return;
    await SetRepo.create(name.trim());
    router.replace(`/home?ts=${Date.now()}`);
  }

  return (
    <Modal title="New set">
      <div className="flex flex-col gap-3">
        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Set name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
          <button onClick={create} className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm">Create</button>
        </div>
      </div>
    </Modal>
  );
}


