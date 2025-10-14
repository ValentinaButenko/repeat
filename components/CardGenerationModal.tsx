"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { safeCreateCard } from '../repo/cards';
import { UserSettingsRepo } from '../repo/userSettings';
import { translate } from '../lib/translation';
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

  // Generate words based on complexity level (in English)
  const getWordsForComplexity = (complexity: string) => {
    const baseWords = {
      Beginner: [
        'Hello', 'Goodbye', 'Please', 'Thank you', 'Yes', 'No', 'Water', 'Food', 'House', 'Family',
        'Friend', 'Love', 'Happy', 'Sad', 'Good', 'Bad', 'Big', 'Small', 'Hot', 'Cold',
        'Red', 'Blue', 'Green', 'White', 'Black', 'Cat', 'Dog', 'Book', 'Car', 'Tree'
      ],
      Intermediate: [
        'Beautiful', 'Important', 'Difficult', 'Interesting', 'Possible', 'Different', 'Special', 'Perfect',
        'Wonderful', 'Amazing', 'Fantastic', 'Excellent', 'Outstanding', 'Remarkable', 'Extraordinary',
        'Magnificent', 'Splendid', 'Brilliant', 'Superb', 'Marvelous', 'Incredible', 'Tremendous',
        'Remarkable', 'Exceptional', 'Outstanding', 'Notable', 'Significant', 'Valuable', 'Precious'
      ],
      Advanced: [
        'Sophisticated', 'Comprehensive', 'Revolutionary', 'Extraordinary', 'Magnificent', 'Phenomenal',
        'Unprecedented', 'Remarkable', 'Exceptional', 'Outstanding', 'Unparalleled', 'Incomparable',
        'Transcendent', 'Eminent', 'Distinguished', 'Prestigious', 'Renowned', 'Illustrious',
        'Celebrated', 'Acclaimed', 'Esteemed', 'Venerated', 'Revered', 'Admired', 'Respected',
        'Honored', 'Lauded', 'Praised', 'Applauded', 'Commended'
      ]
    };

    return baseWords[complexity as keyof typeof baseWords] || baseWords.Beginner;
  };

  // Generate cards with translations
  const generateCardsWithTranslations = async (amount: number, complexity: string, prompt: string) => {
    // Get user language settings
    const userSettings = await UserSettingsRepo.get();
    if (!userSettings) {
      throw new Error('Language settings not found. Please configure your languages in settings.');
    }

    const nativeLanguage = userSettings.nativeLanguage;
    const learningLanguage = userSettings.learningLanguage;
    
    // Get base words in English (native language)
    const words = getWordsForComplexity(complexity);
    const generatedCards = [];
    
    // Generate the requested number of cards
    for (let i = 0; i < amount; i++) {
      // Update progress
      setGenerationProgress({ current: i + 1, total: amount });
      
      const wordIndex = i % words.length;
      const englishWord = words[wordIndex];
      
      // Add context variation based on prompt
      let front = englishWord;
      if (prompt.toLowerCase().includes('food') || prompt.toLowerCase().includes('cooking')) {
        front = `${englishWord} (food context)`;
      } else if (prompt.toLowerCase().includes('business') || prompt.toLowerCase().includes('work')) {
        front = `${englishWord} (business context)`;
      }
      
      // Translate to learning language
      let back = '';
      try {
        back = await translate(front, nativeLanguage, learningLanguage);
        if (!back || back.trim() === '') {
          // Fallback: use the original word if translation fails
          back = front;
        }
      } catch (error) {
        console.warn(`Translation failed for "${front}":`, error);
        back = front; // Fallback to original word
      }
      
      generatedCards.push({ front, back });
    }
    
    return generatedCards;
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
      // Generate cards with translations
      const generatedCards = await generateCardsWithTranslations(cardAmount, complexity, prompt);
      
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
      className="rounded-xl w-full max-w-[600px] h-auto bg-white p-8"
      titleClassName="text-[#1C1D17]"
      titleStyle={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}
    >
      <div className="flex flex-col gap-8">
        {/* Cards Amount Selection */}
        <div className="flex flex-col gap-4">
          <label className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}>
            Cards amount
          </label>
          <div className="flex gap-3">
            {[50, 100, 150, 200].map((amount) => (
              <button
                key={amount}
                onClick={() => setCardAmount(amount as 50 | 100 | 150 | 200)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cardAmount === amount
                    ? 'bg-[#1C1D17] text-white border-2 border-[#1C1D17]'
                    : 'bg-white text-[#1C1D17] border-2 border-[#E5E5E5] hover:border-[#1C1D17]'
                }`}
                style={{ fontFamily: 'var(--font-bitter)' }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Words Complexity Selection */}
        <div className="flex flex-col gap-4">
          <label className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}>
            Words complexity
          </label>
          <div className="flex gap-3">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setComplexity(level as 'Beginner' | 'Intermediate' | 'Advanced')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  complexity === level
                    ? 'bg-[#1C1D17] text-white border-2 border-[#1C1D17]'
                    : 'bg-white text-[#1C1D17] border-2 border-[#E5E5E5] hover:border-[#1C1D17]'
                }`}
                style={{ fontFamily: 'var(--font-bitter)' }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Text Area */}
        <div className="flex flex-col gap-4">
          <label className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 16 }}>
            Topic or prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 p-4 border-2 border-[#E5E5E5] rounded-lg resize-none focus:outline-none focus:border-[#1C1D17]"
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
        <div className="flex items-center justify-between">
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
