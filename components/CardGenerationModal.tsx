"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { safeCreateCard } from '../repo/cards';
import { UserSettingsRepo } from '../repo/userSettings';
import { useGeneration } from './GenerationContext';
import type { UUID } from '../db/types';

interface Props {
  setId: string;
  setName: string;
  onGenerated?: () => void;
}

export default function CardGenerationModal({ setId, setName, onGenerated }: Props) {
  const router = useRouter();
  const { showProgress, updateProgress, hideProgress } = useGeneration();
  const [cardAmount, setCardAmount] = useState<5 | 10 | 15 | 20>(5);
  const [complexity, setComplexity] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [prompt, setPrompt] = useState('Basic words for everyday use');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a topic or prompt');
      return;
    }

    // Close modal immediately and show progress popover
    router.back();
    
    // Show progress popover
    showProgress(0, cardAmount, setName, () => {
      // Stop generation - for now just hide progress
      hideProgress();
    });

    try {
      // Get user language settings
      const userSettings = await UserSettingsRepo.get();
      if (!userSettings) {
        throw new Error('Language settings not found. Please configure your languages in settings.');
      }

      const nativeLanguage = userSettings.nativeLanguage;
      const learningLanguage = userSettings.learningLanguage;
      
      // Start streaming generation
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cardAmount,
          complexity,
          prompt,
          nativeLanguage,
          learningLanguage,
          setId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate cards');
      }

      // Process streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let createdCount = 0;

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // Helper to trigger UI refresh
      const triggerRefresh = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId } }));
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === '[DONE]') {
            console.log(`Generation complete. Created ${createdCount} cards.`);
            triggerRefresh(); // Final refresh to ensure all cards are shown
            hideProgress();
            if (onGenerated) {
              onGenerated();
            }
            return;
          }

          try {
            const word = JSON.parse(data);
            
            if (word.error) {
              throw new Error(word.error);
            }

            // Create card immediately as it arrives
            try {
              await safeCreateCard(
                setId as UUID,
                word.front,
                word.back,
                `Generated from prompt: "${prompt}"`
              );
              createdCount++;
              
              // Update progress
              updateProgress(createdCount);
              
              // Trigger UI update every 3 cards or on first card
              if (createdCount === 1 || createdCount % 3 === 0) {
                triggerRefresh();
              }
            } catch (error) {
              // Skip duplicate cards silently
              if (error instanceof Error && error.message === 'DUPLICATE_FRONT_IN_SET') {
                console.log('Skipping duplicate card:', word.front);
                continue;
              }
              throw error;
            }
          } catch (parseError) {
            console.error('Failed to parse word data:', parseError);
          }
        }
      }
      
      // If we get here without [DONE], generation ended prematurely
      console.log(`Generation ended. Created ${createdCount} cards.`);
      triggerRefresh(); // Final refresh to ensure all cards are shown
      hideProgress();
      if (onGenerated) {
        onGenerated();
      }
    } catch (err) {
      console.error('Generation failed:', err);
      hideProgress();
      // Could show error toast here in the future
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Modal 
      title="Generate set" 
      className="rounded-xl w-full max-w-[600px] h-auto bg-[#F6F4F0] p-8"
      titleClassName="text-[#1C1D17]"
      titleStyle={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}
    >
      <div className="flex flex-col gap-8">
        {/* Cards Amount Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[#494A45]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 16 }}>
            Cards amount
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((amount) => (
              <button
                key={amount}
                onClick={() => setCardAmount(amount as 5 | 10 | 15 | 20)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cardAmount === amount
                    ? 'bg-[#1C1D17] text-white border border-[#1C1D17]'
                    : 'bg-white text-[#1C1D17] border border-[#E8E2D9] hover:border-[#1C1D17]'
                }`}
                style={{ fontFamily: 'var(--font-bitter)' }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Words Complexity Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[#494A45]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 16 }}>
            Words complexity
          </label>
          <div className="flex gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setComplexity(level as 'Beginner' | 'Intermediate' | 'Advanced')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  complexity === level
                    ? 'bg-[#1C1D17] text-white border border-[#1C1D17]'
                    : 'bg-white text-[#1C1D17] border border-[#E8E2D9] hover:border-[#1C1D17]'
                }`}
                style={{ fontFamily: 'var(--font-bitter)' }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Text Area */}
        <div className="flex flex-col gap-3">
          <label className="text-[#494A45]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 16 }}>
            Topic or prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 p-4 border border-[#E8E2D9] rounded-lg resize-none outline-none focus:outline-none focus:border-[#1C1D17] bg-[#FFFFFF]"
            style={{ fontFamily: 'var(--font-bitter)', fontSize: 14 }}
            placeholder="Basic words for everyday use"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm" style={{ fontFamily: 'var(--font-bitter)' }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handleCancel}
            className="text-[#1C1D17] hover:text-gray-600 transition-colors"
            style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 bg-[#1C1D17] text-white hover:bg-gray-800"
            style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}
          >
            Generate
          </button>
        </div>
      </div>
    </Modal>
  );
}
