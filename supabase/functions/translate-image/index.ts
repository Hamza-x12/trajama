import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageData, targetLanguages, uiLanguage, textOnly } = await req.json();
    
    // If textOnly is provided, just translate that text (for region translation)
    if (textOnly) {
      const languagePrompts = {
        en: 'You are a professional multilingual translator specializing in Moroccan Arabic (Darija).',
        fr: 'Vous êtes un traducteur multilingue professionnel spécialisé en arabe marocain (Darija).',
        ar: 'أنت مترجم محترف متعدد اللغات متخصص في العربية المغربية (الدارجة).',
        dar: 'نتا مترجم محترف متعدد اللغات متخصص فالدارجة المغربية.',
        ru: 'Вы профессиональный многоязычный переводчик, специализирующийся на марокканском арабском (дарижа).'
      };

      const systemPrompt = languagePrompts[uiLanguage as keyof typeof languagePrompts] || languagePrompts.en;
      
      const translatePrompt = `Translate the following text into these languages: ${targetLanguages.join(', ')}.

Text to translate:
${textOnly}

Return ONLY a JSON object with this exact structure (no markdown, no additional text):
{
  "darija": "translation",
  "french": "translation",
  "arabic": "translation",
  "english": "translation",
  "spanish": "translation",
  "german": "translation",
  "italian": "translation",
  "portuguese": "translation",
  "chinese": "translation",
  "japanese": "translation",
  "turkish": "translation",
  "russian": "translation",
  "korean": "translation",
  "hindi": "translation"
}`;

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }

      const translateResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: translatePrompt }
          ],
          temperature: 0.3,
        }),
      });

      if (!translateResponse.ok) {
        throw new Error(`Translation failed: ${translateResponse.status}`);
      }

      const translateData = await translateResponse.json();
      let translationsText = translateData.choices[0]?.message?.content?.trim();
      translationsText = translationsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const translations = JSON.parse(translationsText);

      return new Response(
        JSON.stringify({ translations, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // First, extract text with regions from the image
    const extractResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and extract ALL text you find. For each distinct text region (paragraph, heading, label, button text, etc.), provide:
1. The text content
2. The approximate position as percentages (top, left, width, height) where 0,0 is top-left and 100,100 is bottom-right
3. A label describing what type of text it is (heading, paragraph, button, label, etc.)

Return ONLY a JSON array with this exact structure (no markdown, no additional text):
[
  {
    "text": "extracted text here",
    "position": {"top": 10, "left": 20, "width": 30, "height": 5},
    "label": "heading"
  }
]

If you find no text, return an empty array: []`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!extractResponse.ok) {
      if (extractResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (extractResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${extractResponse.status}`);
    }

    const extractData = await extractResponse.json();
    let extractedContent = extractData.choices[0]?.message?.content?.trim();

    // Clean up markdown formatting if present
    extractedContent = extractedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    let textRegions;
    try {
      textRegions = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('Failed to parse extracted regions:', extractedContent);
      // Fallback to simple text extraction
      return new Response(
        JSON.stringify({ 
          error: 'No text found in the image',
          extractedText: ''
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!Array.isArray(textRegions) || textRegions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No text found in the image',
          extractedText: '',
          textRegions: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Combine all text for full translation
    const extractedText = textRegions.map(r => r.text).join('\n');

    // Now translate the extracted text
    const languagePrompts = {
      en: 'You are a professional multilingual translator specializing in Moroccan Arabic (Darija).',
      fr: 'Vous êtes un traducteur multilingue professionnel spécialisé en arabe marocain (Darija).',
      ar: 'أنت مترجم محترف متعدد اللغات متخصص في العربية المغربية (الدارجة).',
      dar: 'نتا مترجم محترف متعدد اللغات متخصص فالدارجة المغربية.',
      ru: 'Вы профессиональный многоязычный переводчик, специализирующийся на марокканском арабском (дарижа).'
    };

    const systemPrompt = languagePrompts[uiLanguage as keyof typeof languagePrompts] || languagePrompts.en;
    
    const translatePrompt = `Translate the following text into these languages: ${targetLanguages.join(', ')}.

Text to translate:
${extractedText}

Return ONLY a JSON object with this exact structure (no markdown, no additional text):
{
  "darija": "translation in Darija (Moroccan Arabic)",
  "french": "translation in French",
  "arabic": "translation in Standard Arabic",
  "english": "translation in English",
  "spanish": "translation in Spanish",
  "german": "translation in German",
  "italian": "translation in Italian",
  "portuguese": "translation in Portuguese",
  "chinese": "translation in Simplified Chinese",
  "japanese": "translation in Japanese",
  "turkish": "translation in Turkish",
  "russian": "translation in Russian",
  "korean": "translation in Korean",
  "hindi": "translation in Hindi"
}`;

    const translateResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: translatePrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!translateResponse.ok) {
      throw new Error(`Translation failed: ${translateResponse.status}`);
    }

    const translateData = await translateResponse.json();
    let translationsText = translateData.choices[0]?.message?.content?.trim();

    // Clean up markdown formatting if present
    translationsText = translationsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    let translations;
    try {
      translations = JSON.parse(translationsText);
    } catch (parseError) {
      console.error('Failed to parse translations:', translationsText);
      throw new Error('Failed to parse translation response');
    }

    return new Response(
      JSON.stringify({
        extractedText,
        translations,
        textRegions,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
