"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { safeCreateCard } from '../repo/cards';
import { UserSettingsRepo } from '../repo/userSettings';
import type { UUID } from '../db/types';

interface Props {
  setId: string;
  onGenerated?: () => void;
}

export default function CardGenerationModal({ setId, onGenerated }: Props) {
  const router = useRouter();
  const [cardAmount, setCardAmount] = useState<50 | 100 | 150 | 200>(50);
  const [complexity, setComplexity] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [prompt, setPrompt] = useState('Basic words for everyday use');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);

  // Generate cards using AI
  const generateCardsWithAI = async (amount: number, complexity: string, prompt: string) => {
    // Get user language settings
    const userSettings = await UserSettingsRepo.get();
    if (!userSettings) {
      throw new Error('Language settings not found. Please configure your languages in settings.');
    }

    const nativeLanguage = userSettings.nativeLanguage;
    const learningLanguage = userSettings.learningLanguage;
    
    // Call the API to generate words with AI
    setGenerationProgress({ current: 0, total: amount });
    
    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
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

      const data = await response.json();
      const generatedCards = data.words || [];

      if (generatedCards.length === 0) {
        throw new Error('No words generated. Please try a different prompt or topic.');
      }

      setGenerationProgress({ current: generatedCards.length, total: amount });
      return generatedCards;
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a topic or prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(null);

    try {
      // Generate cards with AI
      const generatedCards = await generateCardsWithAI(cardAmount, complexity, prompt);
      
      // Create cards in the database
      const createdCards = [];
      for (const cardData of generatedCards) {
        try {
          const card = await safeCreateCard(
            setId as UUID,
            cardData.front,
            cardData.back,
            `Generated from prompt: "${prompt}"`
          );
          createdCards.push(card);
        } catch (error) {
          // Skip duplicate cards
          if (error instanceof Error && error.message === 'DUPLICATE_FRONT_IN_SET') {
            continue;
          }
          throw error;
        }
      }

      console.log(`Generated ${createdCards.length} out of ${cardAmount} cards`);
      
      // Close modal and notify parent
      router.back();
      if (onGenerated) {
        onGenerated();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate cards. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
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
            {[50, 100, 150, 200].map((amount) => (
              <button
                key={amount}
                onClick={() => setCardAmount(amount as 50 | 100 | 150 | 200)}
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

        {/* Progress Message */}
        {generationProgress && (
          <div className="text-[#1C1D17] text-sm" style={{ fontFamily: 'var(--font-bitter)' }}>
            Generating cards... {generationProgress.current} of {generationProgress.total}
          </div>
        )}

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
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#1C1D17] text-white hover:bg-gray-800'
            }`}
            style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}
          >
            {isGenerating ? (generationProgress ? 'Generating...' : 'Generating...') : 'Generate'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
