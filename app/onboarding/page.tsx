"use client";
import { useEffect, useState, useRef } from 'react';
import { UserSettingsRepo } from '../../repo/userSettings';
import { useRouter } from 'next/navigation';
import { LANGUAGE_OPTIONS } from '../../lib/languages';
import { ArrowRight, Play, TrashSimple } from '@phosphor-icons/react';
import { SetRepo } from '../../repo/sets';
import { safeCreateCard, CardRepo } from '../../repo/cards';
import IconButton from '../../components/IconButton';
import type { Card, UUID } from '../../db/types';

type OnboardingStep = 'languages' | 'configure' | 'generating' | 'review';

interface CardComponentProps {
  card: Card;
  onDelete: (cardId: string) => void;
}

function CardComponent({ card, onDelete }: CardComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(card.id);
  };

  return (
    <div
      className="relative rounded-xl p-4 bg-white/30"
      style={{ height: '80px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="text-[#1C1D17]"
        style={{ 
          fontFamily: 'var(--font-bitter)', 
          fontWeight: 600, 
          fontSize: 18
        }}
      >
        {card.front}
      </div>
      <div 
        className="mt-1 text-[#5B5B55]"
        style={{ 
          fontFamily: 'var(--font-bitter)', 
          fontWeight: 400, 
          fontSize: 14
        }}
      >
        {card.back}
      </div>
      <div 
        className="absolute top-2 right-2"
        onClick={handleDeleteClick}
      >
        <IconButton
          onClick={handleDeleteClick}
          aria-label={`Delete card "${card.front}"`}
          visible={isHovered}
        >
          <TrashSimple size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('languages');
  const [learning, setLearning] = useState('');
  const [native, setNative] = useState('');
  const [learningOpen, setLearningOpen] = useState(false);
  const [nativeOpen, setNativeOpen] = useState(false);
  const [learningError, setLearningError] = useState(false);
  const [nativeError, setNativeError] = useState(false);
  
  // Step 2: Configuration
  const [cardAmount, setCardAmount] = useState<10 | 15 | 20>(10);
  const [complexity, setComplexity] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [prompt, setPrompt] = useState('Basic words for everyday use');
  
  // Step 3: Generation
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setId, setSetId] = useState<UUID | null>(null);
  const [setName] = useState('My first set');
  const [generatingTitleIndex, setGeneratingTitleIndex] = useState(0);
  const [titleFading, setTitleFading] = useState(false);
  
  const generatingTitles = [
    "🔮 Channeling linguistic energy...",
    "📚 Whispering to the dictionary...",
    "💭 Extracting smart thoughts...",
    "🌱 Growing word seeds...",
    "🌌 Traversing the galaxy of terms...",
    "📡 Scanning word universe..."
  ];
  
  // Step 4: Review
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  
  const learningRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    UserSettingsRepo.get().then((s) => {
      if (s) router.replace('/home');
    });
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (learningRef.current && !learningRef.current.contains(event.target as Node)) {
        setLearningOpen(false);
      }
      if (nativeRef.current && !nativeRef.current.contains(event.target as Node)) {
        setNativeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cycle through generating titles
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setTitleFading(true);
      
      setTimeout(() => {
        setGeneratingTitleIndex((prev) => (prev + 1) % generatingTitles.length);
        setTitleFading(false);
      }, 300); // Fade out duration
    }, 3000); // Change title every 3 seconds

    return () => clearInterval(interval);
  }, [isGenerating, generatingTitles.length]);

  async function handleLanguagesContinue() {
    const hasLearningError = !learning;
    const hasNativeError = !native;
    
    setLearningError(hasLearningError);
    setNativeError(hasNativeError);
    
    if (learning && native) {
    await UserSettingsRepo.save({ learningLanguage: learning, nativeLanguage: native });
      setStep('configure');
    }
  }

  async function handleGenerateSet() {
    if (!prompt.trim()) return;
    
    // Create the set first
    const newSet = await SetRepo.create(setName);
    setSetId(newSet.id);
    
    // Set random initial title
    setGeneratingTitleIndex(Math.floor(Math.random() * generatingTitles.length));
    
    // Move to generating step
    setStep('generating');
    setIsGenerating(true);
    setGeneratedCount(0);
    
    // Start generation
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cardAmount,
          complexity,
          prompt,
          nativeLanguage: native,
          learningLanguage: learning,
          setId: newSet.id
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to generate cards');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let createdCount = 0;
      const cards: Card[] = [];

      if (!reader) throw new Error('Response body is not readable');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const data = line.slice(6);

          if (data === '[DONE]') {
            setIsGenerating(false);
            // Load all cards for review
            const allCards = await import('../../db').then(m => 
              m.db.cards.where('setId').equals(newSet.id).toArray()
            );
            setGeneratedCards(allCards);
            setStep('review');
            return;
          }

          try {
            const word = JSON.parse(data);
            if (word.error) throw new Error(word.error);

            try {
              const card = await safeCreateCard(
                newSet.id,
                word.front,
                word.back,
                `Generated from prompt: "${prompt}"`
              );
              cards.push(card);
              createdCount++;
              console.log(`Progress: ${createdCount} of ${cardAmount}`);
              setGeneratedCount(createdCount);
            } catch (cardError) {
              if (cardError instanceof Error && cardError.message === 'DUPLICATE_FRONT_IN_SET') {
                console.log('Skipping duplicate:', word.front);
                continue;
              }
              throw cardError;
            }
          } catch (error) {
            console.error('Card creation error:', error);
          }
        }
      }
      
      setIsGenerating(false);
      const allCards = await import('../../db').then(m => 
        m.db.cards.where('setId').equals(newSet.id).toArray()
      );
      setGeneratedCards(allCards);
      setStep('review');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Generation failed:', err);
      }
      setIsGenerating(false);
      // Still show review with whatever we generated
      const allCards = await import('../../db').then(m => 
        m.db.cards.where('setId').equals(newSet.id).toArray()
      );
      setGeneratedCards(allCards);
      setStep('review');
    }
  }

  async function handleStartStudy() {
    if (setId) {
      router.push(`/study/${setId}`);
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      await CardRepo.remove(cardId);
      // Refresh the cards list
      const updatedCards = generatedCards.filter(c => c.id !== cardId);
      setGeneratedCards(updatedCards);
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  }

  // Render based on current step
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#E8E2D9' }}>
      <div 
        className="w-full rounded-[20px] p-16 flex flex-col justify-center"
        style={{ 
          background: step === 'review' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)', 
          height: step === 'review' ? 'auto' : '700px',
          minHeight: step === 'review' ? 'auto' : '700px',
          maxWidth: step === 'review' ? '1280px' : '950px'
        }}
      >
        {step === 'languages' && (
          <>
            <h1 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 600, 
                fontSize: '48px',
                color: '#1C1D17',
                marginBottom: '16px'
              }}
            >
              Welcome to Repeat!
            </h1>
            
            <p 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 400, 
                fontSize: '20px',
                color: '#5B5B55',
                marginBottom: '64px'
              }}
            >
              Let's set your languages first
            </p>

            <div className="flex items-center gap-6">
              <div className="relative" ref={learningRef}>
                <button
                  onClick={() => setLearningOpen(!learningOpen)}
                  className="w-[180px] rounded-lg px-5 py-3 flex items-center justify-between border bg-white transition-colors duration-200 hover:border-[#1C1D17] focus:outline-none focus:border-[#1C1D17]"
                  style={{ 
                    fontFamily: 'var(--font-bitter)', 
                    fontWeight: 400, 
                    fontSize: '18px',
                    color: learning ? '#1C1D17' : '#5B5B55',
                    height: '52px',
                    borderColor: learningError ? '#EE683F' : '#E8E2D9'
                  }}
                >
                  <span>{learning ? LANGUAGE_OPTIONS.find((opt) => opt.code === learning)?.label : 'I learn'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {learningOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#D2D2D1] z-50 max-h-60 overflow-y-auto">
                    {LANGUAGE_OPTIONS.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLearning(code);
                          setLearningOpen(false);
                          setLearningError(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-[#E8E2D9] transition-colors duration-150 ${
                          code === learning ? 'bg-[#E8E2D9] text-[#1C1D17]' : 'text-[#1C1D17]'
                        } first:rounded-t-lg last:rounded-b-lg`}
                        style={{ fontFamily: 'var(--font-bitter)' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ArrowRight size={24} color="#1C1D17" weight="regular" />

              <div className="relative" ref={nativeRef}>
                <button
                  onClick={() => setNativeOpen(!nativeOpen)}
                  className="w-[180px] rounded-lg px-5 py-3 flex items-center justify-between border bg-white transition-colors duration-200 hover:border-[#1C1D17] focus:outline-none focus:border-[#1C1D17]"
                  style={{ 
                    fontFamily: 'var(--font-bitter)', 
                    fontWeight: 400, 
                    fontSize: '18px',
                    color: native ? '#1C1D17' : '#5B5B55',
                    height: '52px',
                    borderColor: nativeError ? '#EE683F' : '#E8E2D9'
                  }}
                >
                  <span>{native ? LANGUAGE_OPTIONS.find((opt) => opt.code === native)?.label : "I'm native in"}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {nativeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#D2D2D1] z-50 max-h-60 overflow-y-auto">
                    {LANGUAGE_OPTIONS.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => {
                          setNative(code);
                          setNativeOpen(false);
                          setNativeError(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-[#E8E2D9] transition-colors duration-150 ${
                          code === native ? 'bg-[#E8E2D9] text-[#1C1D17]' : 'text-[#1C1D17]'
                        } first:rounded-t-lg last:rounded-b-lg`}
                        style={{ fontFamily: 'var(--font-bitter)' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLanguagesContinue}
              className="btn-primary mt-12"
              style={{ 
                width: '180px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Let's go
            </button>
          </>
        )}

        {step === 'configure' && (
          <>
            <h1 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 600, 
                fontSize: '48px',
                color: '#1C1D17',
                marginBottom: '16px'
              }}
            >
              Create your first set
            </h1>
            
            <p 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 400, 
                fontSize: '20px',
                color: '#5B5B55',
                marginBottom: '40px'
              }}
            >
              Let's start from scratch
            </p>

            <div className="flex flex-col gap-6">
              {/* Cards Amount */}
              <div className="flex flex-col gap-3">
                <label className="text-[#494A45]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 16 }}>
                  Cards amount
                </label>
                <div className="flex gap-2">
                  {[10, 15, 20].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCardAmount(amount as 10 | 15 | 20)}
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

              {/* Words Complexity */}
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

              {/* Prompt */}
              <div className="flex flex-col gap-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-20 p-4 border border-[#E8E2D9] rounded-lg resize-none outline-none focus:outline-none focus:border-[#1C1D17] bg-[#FFFFFF]"
                  style={{ fontFamily: 'var(--font-bitter)', fontSize: 14, color: '#5B5B55' }}
                  placeholder="Basic words for everyday use"
                />
              </div>

              <button
                onClick={handleGenerateSet}
                className="btn-primary"
                style={{ 
                  width: 'fit-content',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}
              >
                Generate set
              </button>
            </div>
          </>
        )}

        {step === 'generating' && (
          <div className="flex flex-col justify-center h-full">
            <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes fadeOutDown {
                from {
                  opacity: 1;
                  transform: translateY(0);
                }
                to {
                  opacity: 0;
                  transform: translateY(-10px);
                }
              }
              .title-animated {
                animation: ${titleFading ? 'fadeOutDown' : 'fadeInUp'} 0.3s ease-out;
              }
            `}</style>
            <h1 
              className="m-0 title-animated"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 600, 
                fontSize: '48px',
                color: '#1C1D17',
                marginBottom: '64px'
              }}
            >
              {generatingTitles[generatingTitleIndex]}
            </h1>
            
            <div className="flex items-center gap-4">
              <p 
                className="m-0"
                style={{ 
                  fontFamily: 'var(--font-bitter)', 
                  fontWeight: 400, 
                  fontSize: '20px',
                  color: '#5B5B55'
                }}
              >
                Crafting {cardAmount} cards in {setName}
              </p>

              {/* Spinner */}
              <svg 
                className="animate-spin" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="#1C1D17" 
                  strokeWidth="3" 
                  fill="none" 
                  opacity="0.2" 
                />
                <path 
                  d="M22 12a10 10 0 0 1-10 10" 
                  stroke="#1C1D17" 
                  strokeWidth="3" 
                  fill="none" 
                />
              </svg>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col">
            <h1 
              className="m-0 mb-12"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 600, 
                fontSize: '48px',
                color: '#1C1D17'
              }}
            >
              Your first words to repeat
            </h1>

            <div className="grid grid-cols-4 gap-4 mb-12">
              {generatedCards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteCard}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartStudy}
                className="btn-primary flex items-center gap-2"
                style={{ 
                  width: 'fit-content',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}
              >
                <span>Study</span>
                <Play size={20} weight="fill" />
              </button>
              
              <button
                onClick={() => router.push('/home')}
                className="btn-secondary"
              >
                <span>Skip for now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
