import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, sourceLanguage, targetLanguages, uiLanguage = 'en', checkSpelling = false } = body;
    
    // Input validation
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (text.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Text must be less than 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!sourceLanguage || typeof sourceLanguage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Source language is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Spelling check mode - separate handling
    if (checkSpelling && targetLanguages.length === 0) {
      console.log('Spelling check request received', {
        sourceLanguage,
        textLength: text.length,
        timestamp: new Date().toISOString()
      });
      
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }
      
      const spellCheckResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `You are a spelling and grammar expert for ${sourceLanguage === 'auto' ? 'multiple languages' : sourceLanguage}. Check the text for spelling and grammar errors. If you find errors, provide ONLY the corrected version. If the text is correct, respond with EXACTLY the same text. Do not add any explanations or formatting.` 
            },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
        }),
      });
      
      if (!spellCheckResponse.ok) {
        if (spellCheckResponse.status === 429) {
          console.log('Rate limit hit for spelling check');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('Spelling check API error', { status: spellCheckResponse.status });
        return new Response(
          JSON.stringify({ spellingSuggestion: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const spellData = await spellCheckResponse.json();
      const suggestion = spellData.choices[0].message.content.trim();
      
      return new Response(
        JSON.stringify({ spellingSuggestion: suggestion !== text ? suggestion : null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!Array.isArray(targetLanguages) || targetLanguages.length === 0 || targetLanguages.length > 14) {
      return new Response(
        JSON.stringify({ error: 'Target languages must be an array with 1-14 languages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Translation request received', {
      sourceLanguage,
      targetLanguageCount: targetLanguages.length,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Detect language if needed
    let detectedLanguage = null;
    let actualSourceLanguage = sourceLanguage;

    if (sourceLanguage === 'Detect Language') {
      console.log('Language detection initiated');
      const detectResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are a language detection expert. Detect the language of the given text and respond with ONLY the language name from this list: Darija, French, Arabic, English, Spanish, German, Italian, Portuguese, Chinese, Japanese, Turkish, Russian, Korean, Hindi. Respond with exactly one word.' 
            },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
        }),
      });

      if (detectResponse.ok) {
        const detectData = await detectResponse.json();
        detectedLanguage = detectData.choices[0].message.content.trim();
        actualSourceLanguage = detectedLanguage;
        console.log('Language detected successfully');
      } else {
        console.error('Language detection failed', { status: detectResponse.status });
        actualSourceLanguage = 'Darija';
      }
    }

    // Map UI language codes to full language names
    const uiLanguageMap: Record<string, string> = {
      'en': 'English',
      'ar': 'Arabic',
      'fr': 'French',
      'dar': 'Darija',
      'ru': 'Russian',
      'ko': 'Korean',
      'hi': 'Hindi'
    };
    
    const culturalNotesLanguage = uiLanguageMap[uiLanguage] || 'English';

    // Construct the system prompt based on the direction of translation
    let systemPrompt = `You are a culturally aware multilingual translator specialized in Moroccan Darija. You must:

🔁 Bidirectional Translation Logic
• If input is in Darija: Translate into the requested target languages with cultural context.
• If input is in another language: Translate into Moroccan Darija first, then other requested languages.
• Preserve tone, humor, and emotional nuance across languages.
• Explain slang, idioms, or cultural references when relevant.
• Support both Arabic script and Latin transliteration.
• Detect and reflect regional dialects (Fassi, Casaoui, Rifi) when relevant.

📚 Dataset Integration
• Use knowledge of Moroccan Darija vocabulary, conjugations, and gender-aware translation.
• Respect spelling variations and regional forms.

📐 Output Format
Provide translations in this EXACT JSON format:
{
  "translations": {
    "darija": "translation or original if already in Darija",
    "french": "French translation",
    "arabic": "Modern Standard Arabic translation",
    "english": "English translation",
    "spanish": "Spanish translation",
    "german": "German translation",
    "italian": "Italian translation",
    "portuguese": "Portuguese translation",
    "chinese": "Chinese translation",
    "japanese": "Japanese translation",
    "turkish": "Turkish translation",
    "russian": "Russian translation",
    "korean": "Korean translation",
    "hindi": "Hindi translation"
  },
  "culturalNotes": "Optional cultural context or explanation of idioms/slang IN ${culturalNotesLanguage}"
}

IMPORTANT: 
- You must return ONLY valid JSON, no additional text before or after.
- The culturalNotes field MUST be written in ${culturalNotesLanguage}, not English or any other language.`;

    const userPrompt = `Translate the following text from ${actualSourceLanguage} into ${targetLanguages.join(', ')}:\n\n"${text}"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error', { status: response.status });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service requires additional credits. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('Translation completed successfully');

    // Parse the JSON response
    let translationResult;
    try {
      // Try to extract JSON if there's additional text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translationResult = JSON.parse(jsonMatch[0]);
      } else {
        translationResult = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response');
      // Fallback: return the raw response
      translationResult = {
        translations: {
          darija: actualSourceLanguage === 'Darija' ? text : aiResponse,
          french: '',
          arabic: '',
          english: '',
          spanish: '',
          german: '',
          italian: '',
          portuguese: '',
          chinese: '',
          japanese: '',
          turkish: '',
          russian: '',
          korean: '',
          hindi: ''
        },
        culturalNotes: 'Translation formatting error. Please try again.'
      };
    }

    // Add detected language to response if language was detected
    if (detectedLanguage) {
      translationResult.detectedLanguage = detectedLanguage;
    }

    return new Response(
      JSON.stringify(translationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error', { 
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: 'Translation failed',
        details: 'An error occurred during translation. Please try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
