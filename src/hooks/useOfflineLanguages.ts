import { useState, useEffect } from 'react';

export interface OfflineLanguage {
  code: string;
  name: string;
  downloaded: boolean;
  size?: string;
}

const OFFLINE_LANGUAGES_KEY = 'tarjama-offline-languages';

export function useOfflineLanguages() {
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [offlineLanguages, setOfflineLanguages] = useState<OfflineLanguage[]>([
    { code: 'ar', name: 'Arabic', downloaded: false, size: '150 MB' },
    { code: 'fr', name: 'French', downloaded: false, size: '150 MB' },
    { code: 'dar', name: 'Darija', downloaded: false, size: '150 MB' },
    { code: 'en', name: 'English', downloaded: false, size: '150 MB' },
    { code: 'es', name: 'Spanish', downloaded: false, size: '150 MB' },
    { code: 'de', name: 'German', downloaded: false, size: '150 MB' },
    { code: 'it', name: 'Italian', downloaded: false, size: '150 MB' },
    { code: 'pt', name: 'Portuguese', downloaded: false, size: '150 MB' },
    { code: 'zh', name: 'Chinese', downloaded: false, size: '150 MB' },
    { code: 'ja', name: 'Japanese', downloaded: false, size: '150 MB' },
    { code: 'tr', name: 'Turkish', downloaded: false, size: '150 MB' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_LANGUAGES_KEY);
    if (stored) {
      const downloadedCodes = JSON.parse(stored);
      setOfflineLanguages(prev =>
        prev.map(lang => ({
          ...lang,
          downloaded: downloadedCodes.includes(lang.code)
        }))
      );
    }
  }, []);

  const downloadLanguage = async (code: string, onProgress?: (progress: number) => void) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [code]: 0 }));
      
      // Import the local translation utility
      const { loadTranslationModel } = await import('@/utils/localTranslation');
      
      // Map language codes to names for the model loader
      const langMap: Record<string, string> = {
        'ar': 'Arabic',
        'fr': 'French',
        'dar': 'Darija',
        'en': 'English',
        'es': 'Spanish',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'tr': 'Turkish',
        'ru': 'Russian',
        'ko': 'Korean',
        'hi': 'Hindi'
      };

      const langName = langMap[code] || code;
      
      // Simulate progress for model 1 (0-50%)
      setDownloadProgress(prev => ({ ...prev, [code]: 10 }));
      onProgress?.(10);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setDownloadProgress(prev => ({ ...prev, [code]: 25 }));
      onProgress?.(25);
      
      // Load translation models for this language (to/from English as pivot)
      await loadTranslationModel(langName, 'English');
      
      setDownloadProgress(prev => ({ ...prev, [code]: 50 }));
      onProgress?.(50);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setDownloadProgress(prev => ({ ...prev, [code]: 75 }));
      onProgress?.(75);
      
      await loadTranslationModel('English', langName);
      
      setDownloadProgress(prev => ({ ...prev, [code]: 100 }));
      onProgress?.(100);
      
      const stored = localStorage.getItem(OFFLINE_LANGUAGES_KEY);
      const downloadedCodes = stored ? JSON.parse(stored) : [];
      
      if (!downloadedCodes.includes(code)) {
        downloadedCodes.push(code);
        localStorage.setItem(OFFLINE_LANGUAGES_KEY, JSON.stringify(downloadedCodes));
      }

      setOfflineLanguages(prev =>
        prev.map(lang =>
          lang.code === code ? { ...lang, downloaded: true } : lang
        )
      );
      
      // Clear progress after completion
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[code];
          return newProgress;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to download language:', error);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[code];
        return newProgress;
      });
      throw error;
    }
  };

  const removeLanguage = async (code: string) => {
    const stored = localStorage.getItem(OFFLINE_LANGUAGES_KEY);
    const downloadedCodes = stored ? JSON.parse(stored) : [];
    
    const filtered = downloadedCodes.filter((c: string) => c !== code);
    localStorage.setItem(OFFLINE_LANGUAGES_KEY, JSON.stringify(filtered));

    setOfflineLanguages(prev =>
      prev.map(lang =>
        lang.code === code ? { ...lang, downloaded: false } : lang
      )
    );

    // Note: We don't actually clear the cached models from memory
    // as they may still be useful for other language pairs
  };

  return {
    offlineLanguages,
    downloadLanguage,
    removeLanguage,
    downloadProgress
  };
}
