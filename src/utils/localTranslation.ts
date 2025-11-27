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

// Language code mapping for models
const languageMap: Record<string, string> = {
  'Darija': 'arb_Arab', // Moroccan Arabic
  'Arabic': 'arb_Arab',
  'French': 'fra_Latn',
  'English': 'eng_Latn',
  'Spanish': 'spa_Latn',
  'German': 'deu_Latn',
  'Italian': 'ita_Latn',
  'Portuguese': 'por_Latn',
  'Chinese': 'zho_Hans',
  'Japanese': 'jpn_Jpan',
  'Turkish': 'tur_Latn',
  'Russian': 'rus_Cyrl',
  'Korean': 'kor_Hang',
  'Hindi': 'hin_Deva'
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
    
    // Use a lightweight translation model from Hugging Face
    const model = await pipeline(
      'translation',
      'Xenova/nllb-200-distilled-600M',
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
      max_length: 512
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
