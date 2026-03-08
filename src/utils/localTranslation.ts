import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js — avoid browser Cache API to prevent SW conflicts
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.useBrowserCache = false;  // Use IndexedDB only, not Cache API (avoids SW interception)
env.useCustomCache = true;    // Use the built-in IndexedDB cache

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

// Verified Xenova opus-mt models on HuggingFace (confirmed to exist)
const opusModelMap: Record<string, string> = {
  // Arabic
  'ar-en': 'Xenova/opus-mt-ar-en',
  'en-ar': 'Xenova/opus-mt-en-ar',
  // French
  'fr-en': 'Xenova/opus-mt-fr-en',
  'en-fr': 'Xenova/opus-mt-en-fr',
  // Spanish
  'es-en': 'Xenova/opus-mt-es-en',
  'en-es': 'Xenova/opus-mt-en-es',
  // German
  'de-en': 'Xenova/opus-mt-de-en',
  'en-de': 'Xenova/opus-mt-en-de',
  // Italian
  'it-en': 'Xenova/opus-mt-it-en',
  'en-it': 'Xenova/opus-mt-en-it',
  // Chinese
  'zh-en': 'Xenova/opus-mt-zh-en',
  'en-zh': 'Xenova/opus-mt-en-zh',
  // Russian
  'ru-en': 'Xenova/opus-mt-ru-en',
  'en-ru': 'Xenova/opus-mt-en-ru',
  // Japanese (uses "jap" code in opus-mt)
  'ja-en': 'Xenova/opus-mt-jap-en',
  'en-ja': 'Xenova/opus-mt-en-jap',
  // Hindi
  'hi-en': 'Xenova/opus-mt-hi-en',
  'en-hi': 'Xenova/opus-mt-en-hi',
  // Korean (only ko→en exists, use en-mul for reverse)
  'ko-en': 'Xenova/opus-mt-ko-en',
  'en-ko': 'Xenova/opus-mt-en-mul',
  // Turkish (only tr→en exists, use en-mul for reverse)
  'tr-en': 'Xenova/opus-mt-tr-en',
  'en-tr': 'Xenova/opus-mt-en-mul',
  // Portuguese (use mul-en / en-ROMANCE)
  'pt-en': 'Xenova/opus-mt-mul-en',
  'en-pt': 'Xenova/opus-mt-en-ROMANCE',
};

// Language name → ISO code
const languageMap: Record<string, string> = {
  'Darija': 'ar',
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

function getModelId(sourceLang: string, targetLang: string): string {
  const key = `${sourceLang}-${targetLang}`;
  const model = opusModelMap[key];
  if (!model) {
    throw new Error(`No offline model available for ${sourceLang} → ${targetLang}`);
  }
  return model;
}

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
    const modelId = getModelId(sourceLang, targetLang);
    console.log(`Loading opus-mt model: ${modelId} (${sourceLang} → ${targetLang})`);
    
    const model = await pipeline(
      'translation',
      modelId,
      {
        dtype: 'q4',  // Use 4-bit quantized models (~30-50MB instead of ~230MB)
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
    if (!translationPipelines.has(pipelineKey)) {
      await loadTranslationModel(sourceLanguage, targetLanguage, onProgress);
    }

    const pipelineInstance = translationPipelines.get(pipelineKey);
    if (!pipelineInstance) {
      throw new Error('Translation pipeline not available');
    }

    console.log(`Translating with opus-mt: ${text.substring(0, 50)}...`);
    
    // For multilingual models, we need to specify source/target language
    const modelId = getModelId(sourceLang, targetLang);
    const opts: any = { max_new_tokens: 256 };
    
    // en-mul and mul-en models need language prefix
    if (modelId.includes('mul-en') || modelId.includes('en-mul') || modelId.includes('en-ROMANCE')) {
      opts.src_lang = sourceLang;
      opts.tgt_lang = targetLang;
    }

    const result = await pipelineInstance.model(text, opts);
    return result[0].translation_text || text;
  } catch (error) {
    console.error('Local translation error:', error);
    throw new Error('Failed to translate using local model');
  }
}

export function isModelLoaded(sourceLanguage: string, targetLanguage: string): boolean {
  const sourceLang = languageMap[sourceLanguage] || sourceLanguage.toLowerCase();
  const targetLang = languageMap[targetLanguage] || targetLanguage.toLowerCase();
  return translationPipelines.has(`${sourceLang}-${targetLang}`);
}

export function clearAllModels(): void {
  translationPipelines.clear();
  console.log('All translation models cleared');
}

export async function isModelCached(sourceLang?: string, targetLang?: string): Promise<boolean> {
  try {
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    if (sourceLang && targetLang) {
      const modelId = opusModelMap[`${sourceLang}-${targetLang}`];
      return modelId ? keys.some(key => key.url.includes(modelId.split('/')[1])) : false;
    }
    return keys.some(key => key.url.includes('opus-mt'));
  } catch {
    return false;
  }
}
