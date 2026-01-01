import { pipeline, env } from '@huggingface/transformers';

// Configure to use cached models from IndexedDB
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.useBrowserCache = true; // Enable browser caching

interface TranslationPipeline {
  model: any;
  source: string;
  target: string;
}

// Progress callback type
export type ProgressCallback = (progress: {
  status: 'downloading' | 'loading' | 'ready';
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}) => void;

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

export async function loadTranslationModel(
  sourceLanguage: string, 
  targetLanguage: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  const pipelineKey = `${sourceLang}-${targetLang}`;
  
  if (translationPipelines.has(pipelineKey)) {
    onProgress?.({ status: 'ready' });
    return;
  }

  try {
    console.log(`Loading translation model: ${sourceLang} -> ${targetLang}`);
    
    // Use the smaller model with progress callback
    const model = await pipeline(
      'translation',
      'Xenova/m2m100_418M',
      {
        device: 'webgpu',
        progress_callback: (progressData: any) => {
          if (progressData.status === 'progress') {
            onProgress?.({
              status: 'downloading',
              file: progressData.file,
              progress: progressData.progress,
              loaded: progressData.loaded,
              total: progressData.total
            });
          } else if (progressData.status === 'done') {
            onProgress?.({ status: 'loading' });
          } else if (progressData.status === 'ready') {
            onProgress?.({ status: 'ready' });
          }
        }
      }
    );

    translationPipelines.set(pipelineKey, {
      model,
      source: sourceLang,
      target: targetLang
    });

    onProgress?.({ status: 'ready' });
    console.log(`Model loaded successfully: ${pipelineKey}`);
  } catch (error) {
    console.error(`Failed to load translation model:`, error);
    throw new Error(`Failed to load translation model for ${sourceLanguage} to ${targetLanguage}`);
  }
}

export async function translateLocally(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  const pipelineKey = `${sourceLang}-${targetLang}`;

  try {
    // Load model if not already loaded
    if (!translationPipelines.has(pipelineKey)) {
      await loadTranslationModel(sourceLanguage, targetLanguage, onProgress);
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

// Check if model is cached in browser
export async function isModelCached(): Promise<boolean> {
  try {
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    return keys.some(key => key.url.includes('m2m100'));
  } catch {
    return false;
  }
}
