import { pipeline, env } from '@huggingface/transformers';

// Configure to use local models
env.allowLocalModels = true;
env.allowRemoteModels = true;

interface TranslationPipeline {
  model: any;
  source: string;
  target: string;
}

const translationPipelines: Map<string, TranslationPipeline> = new Map();

// Language code mapping for m2m100 model (uses ISO 639-1 codes)
const languageMap: Record<string, string> = {
  'Darija': 'ar', // Moroccan Arabic (uses Arabic)
  'Arabic': 'ar',
  'French': 'fr',
  'English': 'en',
  'Spanish': 'es',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'Turkish': 'tr',
  'Russian': 'ru',
  'Korean': 'ko',
  'Hindi': 'hi'
};

export async function loadTranslationModel(sourceLanguage: string, targetLanguage: string): Promise<void> {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  const pipelineKey = `${sourceLang}-${targetLang}`;
  
  if (translationPipelines.has(pipelineKey)) {
    return;
  }

  try {
    console.log(`Loading translation model: ${sourceLang} -> ${targetLang}`);
    
    // Use the smaller distilled model (~300MB instead of ~600MB)
    // For even smaller size, we could use opus-mt models but they're language-pair specific
    const model = await pipeline(
      'translation',
      'Xenova/m2m100_418M',
      {
        device: 'webgpu', // Try WebGPU for better performance, falls back to CPU
      }
    );

    translationPipelines.set(pipelineKey, {
      model,
      source: sourceLang,
      target: targetLang
    });

    console.log(`Model loaded successfully: ${pipelineKey}`);
  } catch (error) {
    console.error(`Failed to load translation model:`, error);
    throw new Error(`Failed to load translation model for ${sourceLanguage} to ${targetLanguage}`);
  }
}

export async function translateLocally(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  const pipelineKey = `${sourceLang}-${targetLang}`;

  try {
    // Load model if not already loaded
    if (!translationPipelines.has(pipelineKey)) {
      await loadTranslationModel(sourceLanguage, targetLanguage);
    }

    const pipeline = translationPipelines.get(pipelineKey);
    if (!pipeline) {
      throw new Error('Translation pipeline not available');
    }

    console.log(`Translating with local model: ${text.substring(0, 50)}...`);
    
    const result = await pipeline.model(text, {
      src_lang: sourceLang,
      tgt_lang: targetLang,
      max_new_tokens: 256
    });

    return result[0].translation_text || text;
  } catch (error) {
    console.error('Local translation error:', error);
    throw new Error('Failed to translate using local model');
  }
}

export function isModelLoaded(sourceLanguage: string, targetLanguage: string): boolean {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  const pipelineKey = `${sourceLang}-${targetLang}`;
  return translationPipelines.has(pipelineKey);
}

export function clearAllModels(): void {
  translationPipelines.clear();
  console.log('All translation models cleared');
}
