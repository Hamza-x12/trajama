import { pipeline, env } from '@huggingface/transformers';

// Configure to use cached models from IndexedDB
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.useBrowserCache = true;

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

// Per-language opus-mt models (Helsinki-NLP via Xenova, ~15-30MB each direction)
// Format: Xenova/opus-mt-{src}-{tgt}
const opusModelMap: Record<string, string> = {
  'ar-en': 'Xenova/opus-mt-ar-en',
  'en-ar': 'Xenova/opus-mt-en-ar',
  'fr-en': 'Xenova/opus-mt-fr-en',
  'en-fr': 'Xenova/opus-mt-en-fr',
  'es-en': 'Xenova/opus-mt-es-en',
  'en-es': 'Xenova/opus-mt-en-es',
  'de-en': 'Xenova/opus-mt-de-en',
  'en-de': 'Xenova/opus-mt-en-de',
  'it-en': 'Xenova/opus-mt-it-en',
  'en-it': 'Xenova/opus-mt-en-it',
  'pt-en': 'Xenova/opus-mt-tc-big-en', // Portuguese via Romance group
  'en-pt': 'Xenova/opus-mt-en-roa',    // English to Romance group
  'zh-en': 'Xenova/opus-mt-zh-en',
  'en-zh': 'Xenova/opus-mt-en-zh',
  'ja-en': 'Xenova/opus-mt-ja-en',
  'en-ja': 'Xenova/opus-mt-en-jap',
  'tr-en': 'Xenova/opus-mt-tr-en',
  'en-tr': 'Xenova/opus-mt-en-trk',
  'ru-en': 'Xenova/opus-mt-ru-en',
  'en-ru': 'Xenova/opus-mt-en-ru',
  'ko-en': 'Xenova/opus-mt-ko-en',
  'en-ko': 'Xenova/opus-mt-en-ko',
  'hi-en': 'Xenova/opus-mt-hi-en',
  'en-hi': 'Xenova/opus-mt-en-hi',
};

// Language name → ISO code
const languageMap: Record<string, string> = {
  'Darija': 'ar', // Uses Arabic model as closest match
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
    throw new Error(`No offline model available for ${sourceLang} → ${targetLang}. Try translating via English as a bridge.`);
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

    const pipelineInstance = translationPipelines.get(pipelineKey);
    if (!pipelineInstance) {
      throw new Error('Translation pipeline not available');
    }

    console.log(`Translating with opus-mt: ${text.substring(0, 50)}...`);
    
    const result = await pipelineInstance.model(text, {
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

// Check if a specific language pair model is cached
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
