import { NextResponse } from 'next/server';

interface GenerateCardsRequest {
  amount: number;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  prompt: string;
  nativeLanguage: string;
  learningLanguage: string;
  setId: string;
}

export async function POST(req: Request) {
  try {
    const { amount, complexity, prompt, nativeLanguage, learningLanguage, setId }: GenerateCardsRequest = await req.json();

    // Validate input
    if (!amount || amount < 1 || amount > 200) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!setId?.trim()) {
      return NextResponse.json({ error: 'Set ID is required' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream cards as they're generated
          await streamGenerateUniqueWords(
            amount,
            complexity,
            prompt,
            nativeLanguage,
            learningLanguage,
            setId,
            openaiKey,
            (word) => {
              // Send each word as it's generated
              const data = JSON.stringify(word);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          );
          
          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ error: 'Failed to generate cards' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error generating cards:', error);
    return NextResponse.json(
      { error: 'Failed to generate cards' },
      { status: 500 }
    );
  }
}

async function generateWordsWithOpenAI(
  amount: number,
  complexity: string,
  prompt: string,
  nativeLanguage: string,
  learningLanguage: string,
  apiKey: string
): Promise<Array<{ front: string; back: string }>> {
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Create a detailed prompt for OpenAI
  const complexityGuide = {
    Beginner: 'simple, common, everyday words that beginners should learn first (A1-A2 level)',
    Intermediate: 'moderately complex words for intermediate learners (B1-B2 level)',
    Advanced: 'sophisticated, nuanced vocabulary for advanced learners (C1-C2 level)'
  };

  const systemPrompt = `You are a language learning expert. Generate vocabulary words for flashcards.
- Topic: ${prompt}
- Complexity: ${complexityGuide[complexity as keyof typeof complexityGuide]}
- Generate EXACTLY ${amount} unique words or short phrases
- Words should be in ${learningLanguage} (the language the user is learning)
- Provide the translation in ${nativeLanguage} (the user's native language)
- Return ONLY a JSON object with this exact format: {"words": [{"front": "word in ${learningLanguage}", "back": "translation in ${nativeLanguage}"}, ...]}
- No explanations, no additional text, ONLY the JSON object
- Ensure all words are relevant to the topic: "${prompt}"
- Make words diverse and useful for learning`;

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${amount} vocabulary words for: ${prompt}` }
        ],
        temperature: 0.8, // Some creativity for word variety
        response_format: { type: 'json_object' },
        max_tokens: 4000
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    
    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      // If direct parsing fails, try to extract JSON from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse OpenAI response');
      }
    }

    // Handle different possible response formats
    let words = Array.isArray(parsed) ? parsed : (parsed.words || parsed.cards || []);
    
    console.log('OpenAI response parsed:', { parsed, words });
    
    // Validate and clean the response
    words = words
      .filter((w: { front?: string; back?: string }) => w?.front && w?.back)
      .map((w: { front: string; back: string }) => ({
        front: String(w.front).trim(),
        back: String(w.back).trim()
      }))
      .slice(0, amount); // Ensure we don't exceed requested amount

    if (words.length === 0) {
      throw new Error('No valid words generated');
    }

    return words;
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw error;
  }
}

// Free fallback method using predefined words + translation
async function generateWordsWithFreeMethod(
  amount: number,
  complexity: string,
  prompt: string,
  nativeLanguage: string,
  learningLanguage: string
): Promise<Array<{ front: string; back: string }>> {
  // Get predefined words based on complexity
  const baseWords = getWordsForComplexity(complexity);
  const generatedCards = [];
  
  // Generate the requested number of cards
  for (let i = 0; i < amount; i++) {
    const wordIndex = i % baseWords.length;
    const englishWord = baseWords[wordIndex];
    
    // Add context variation based on prompt
    let front = englishWord;
    if (prompt.toLowerCase().includes('food') || prompt.toLowerCase().includes('cooking')) {
      front = `${englishWord} (food context)`;
    } else if (prompt.toLowerCase().includes('business') || prompt.toLowerCase().includes('work')) {
      front = `${englishWord} (business context)`;
    } else if (prompt.toLowerCase().includes('travel')) {
      front = `${englishWord} (travel context)`;
    }
    
    // Use free translation service - translate from English to learning language
    let learningWord = '';
    try {
      const { translate } = await import('../../../lib/translation');
      learningWord = await translate(front, 'en', learningLanguage);
      if (!learningWord || learningWord.trim() === '') {
        learningWord = front; // Fallback to original word
      }
    } catch (error) {
      console.warn(`Translation failed for "${front}":`, error);
      learningWord = front; // Fallback to original word
    }
    
    // Front = learning language, Back = native language (English)
    generatedCards.push({ front: learningWord, back: front });
  }
  
  return generatedCards;
}

function getWordsForComplexity(complexity: string) {
  const baseWords = {
    Beginner: [
      'Hello', 'Goodbye', 'Please', 'Thank you', 'Yes', 'No', 'Water', 'Food', 'House', 'Family',
      'Friend', 'Love', 'Happy', 'Sad', 'Good', 'Bad', 'Big', 'Small', 'Hot', 'Cold',
      'Red', 'Blue', 'Green', 'White', 'Black', 'Cat', 'Dog', 'Book', 'Car', 'Tree',
      'Time', 'Money', 'Work', 'Home', 'School', 'Help', 'Come', 'Go', 'See', 'Know',
      'Think', 'Want', 'Need', 'Like', 'Make', 'Take', 'Give', 'Get', 'Find', 'Use'
    ],
    Intermediate: [
      'Beautiful', 'Important', 'Difficult', 'Interesting', 'Possible', 'Different', 'Special', 'Perfect',
      'Wonderful', 'Amazing', 'Fantastic', 'Excellent', 'Outstanding', 'Remarkable', 'Extraordinary',
      'Magnificent', 'Splendid', 'Brilliant', 'Superb', 'Marvelous', 'Incredible', 'Tremendous',
      'Remarkable', 'Exceptional', 'Outstanding', 'Notable', 'Significant', 'Valuable', 'Precious',
      'Professional', 'Personal', 'Public', 'Private', 'General', 'Specific', 'Common', 'Rare',
      'Simple', 'Complex', 'Easy', 'Hard', 'Quick', 'Slow', 'Fast', 'Early', 'Late', 'Recent'
    ],
    Advanced: [
      'Sophisticated', 'Comprehensive', 'Revolutionary', 'Extraordinary', 'Magnificent', 'Phenomenal',
      'Unprecedented', 'Remarkable', 'Exceptional', 'Outstanding', 'Unparalleled', 'Incomparable',
      'Transcendent', 'Eminent', 'Distinguished', 'Prestigious', 'Renowned', 'Illustrious',
      'Celebrated', 'Acclaimed', 'Esteemed', 'Venerated', 'Revered', 'Admired', 'Respected',
      'Honored', 'Lauded', 'Praised', 'Applauded', 'Commended', 'Acknowledged', 'Recognized',
      'Established', 'Institutional', 'Conventional', 'Traditional', 'Contemporary', 'Modern',
      'Innovative', 'Cutting-edge', 'State-of-the-art', 'Groundbreaking', 'Pioneering', 'Trailblazing'
    ]
  };

  return baseWords[complexity as keyof typeof baseWords] || baseWords.Beginner;
}

// Streaming version that emits words one at a time
async function streamGenerateUniqueWords(
  amount: number,
  complexity: string,
  prompt: string,
  nativeLanguage: string,
  learningLanguage: string,
  setId: string,
  openaiKey: string | undefined,
  onWord: (word: { front: string; back: string }) => void
): Promise<void> {
  const maxAttempts = 3;
  let generatedCount = 0;
  let attempt = 0;
  const seenWords = new Set<string>();

  while (generatedCount < amount && attempt < maxAttempts) {
    attempt++;
    const remainingAmount = amount - generatedCount;
    
    let words: Array<{ front: string; back: string }> = [];
    
    // Try OpenAI first if available
    if (openaiKey && openaiKey !== 'your-api-key-here') {
      try {
        words = await generateWordsWithOpenAI(
          remainingAmount,
          complexity,
          prompt,
          nativeLanguage,
          learningLanguage,
          openaiKey
        );
      } catch (error) {
        console.warn(`OpenAI generation attempt ${attempt} failed, falling back to free method:`, error);
      }
    }
    
    // Fallback to free method if OpenAI failed or not available
    if (words.length === 0) {
      words = await generateWordsWithFreeMethod(
        remainingAmount,
        complexity,
        prompt,
        nativeLanguage,
        learningLanguage
      );
    }
    
    // Filter out in-session duplicates and stream each word
    let newWordsCount = 0;
    for (const word of words) {
      if (generatedCount >= amount) break;
      
      const normalizedFront = word.front.toLowerCase().trim();
      
      // Check if we've already emitted this word in this session
      if (seenWords.has(normalizedFront)) continue;
      
      // Mark as seen and emit (duplicate checking will happen on client side)
      seenWords.add(normalizedFront);
      onWord(word);
      generatedCount++;
      newWordsCount++;
    }
    
    console.log(`Attempt ${attempt}: Streamed ${newWordsCount} words, total: ${generatedCount}/${amount}`);
    
    // If we got no new words, break to avoid infinite loop
    if (newWordsCount === 0) {
      console.warn('No new words generated, stopping attempts');
      break;
    }
  }
}

