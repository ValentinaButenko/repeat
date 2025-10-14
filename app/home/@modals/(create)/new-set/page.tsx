"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../../../../components/Modal';
import { SetRepo } from '../../../../../repo/sets';

export default function NewSetModal() {
  const [name, setName] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when modal opens (active state by default)
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function create() {
    if (!name.trim()) return;
    try {
      const newSet = await SetRepo.create(name.trim());
      router.push(`/sets/${newSet.id}`); // Navigate to the newly created set
    } catch (error) {
      console.error('Failed to create set:', error);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        create();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <Modal 
      title="Create new set" 
      className="w-[540px] h-[340px] bg-[#F6F4F0] rounded-lg p-8"
      titleClassName="font-bitter font-bold text-2xl"
      titleStyle={{ color: '#1C1D17' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-6">
          <input 
            ref={inputRef}
            className="input" 
            placeholder="Set name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="btn-secondary">
            Cancel
            <span className="ml-2 opacity-60" style={{ color: '#1C1D17' }}>Esc</span>
          </button>
          <button 
            onClick={create} 
            className="btn-primary"
            style={{ paddingLeft: '24px', paddingRight: '24px', width: 'auto' }}
          >
            Create
            <span className="ml-2" style={{ color: '#9F9E9A' }}>↵</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
