import { useState, useEffect, useRef } from 'react';

export interface OfflineLanguage {
  code: string;
  name: string;
  downloaded: boolean;
  size?: string;
}

export type DownloadState = 'idle' | 'downloading' | 'paused' | 'completed';

const OFFLINE_LANGUAGES_KEY = 'tarjama-offline-languages';
const DOWNLOAD_STATES_KEY = 'tarjama-download-states';
const PARTIAL_PROGRESS_KEY = 'tarjama-partial-progress';

export function useOfflineLanguages() {
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloadStates, setDownloadStates] = useState<{ [key: string]: DownloadState }>({});
  const abortControllers = useRef<{ [key: string]: AbortController }>({});
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
    const storedStates = localStorage.getItem(DOWNLOAD_STATES_KEY);
    const storedProgress = localStorage.getItem(PARTIAL_PROGRESS_KEY);
    
    if (stored) {
      const downloadedCodes = JSON.parse(stored);
      setOfflineLanguages(prev =>
        prev.map(lang => ({
          ...lang,
          downloaded: downloadedCodes.includes(lang.code)
        }))
      );
    }
    
    if (storedStates) {
      setDownloadStates(JSON.parse(storedStates));
    }
    
    if (storedProgress) {
      setDownloadProgress(JSON.parse(storedProgress));
    }
  }, []);

  const downloadLanguage = async (code: string, onProgress?: (progress: number) => void) => {
    try {
      // Check if resuming from paused state
      const storedProgress = localStorage.getItem(PARTIAL_PROGRESS_KEY);
      const partialProgress = storedProgress ? JSON.parse(storedProgress) : {};
      const startProgress = partialProgress[code] || 0;
      
      // Create abort controller for this download
      const controller = new AbortController();
      abortControllers.current[code] = controller;
      
      setDownloadProgress(prev => ({ ...prev, [code]: startProgress }));
      setDownloadStates(prev => {
        const newStates = { ...prev, [code]: 'downloading' as DownloadState };
        localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
        return newStates;
      });
      
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
      
      // Check if we should skip already loaded parts
      if (startProgress < 50) {
        // Load first model (to target language)
        if (startProgress < 10) {
          setDownloadProgress(prev => ({ ...prev, [code]: 10 }));
          onProgress?.(10);
          const updated1 = { ...partialProgress, [code]: 10 };
          localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(updated1));
        }
        
        if (controller.signal.aborted) throw new Error('Download paused');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (startProgress < 25) {
          setDownloadProgress(prev => ({ ...prev, [code]: 25 }));
          onProgress?.(25);
          const updated2 = { ...partialProgress, [code]: 25 };
          localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(updated2));
        }
        
        if (controller.signal.aborted) throw new Error('Download paused');
        await loadTranslationModel(langName, 'English');
        
        setDownloadProgress(prev => ({ ...prev, [code]: 50 }));
        onProgress?.(50);
        const updated3 = { ...partialProgress, [code]: 50 };
        localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(updated3));
      }
      
      if (controller.signal.aborted) throw new Error('Download paused');
      
      if (startProgress < 100) {
        // Load second model (from target language)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (startProgress < 75) {
          setDownloadProgress(prev => ({ ...prev, [code]: 75 }));
          onProgress?.(75);
          const updated4 = { ...partialProgress, [code]: 75 };
          localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(updated4));
        }
        
        if (controller.signal.aborted) throw new Error('Download paused');
        await loadTranslationModel('English', langName);
        
        setDownloadProgress(prev => ({ ...prev, [code]: 100 }));
        onProgress?.(100);
      }
      
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
      
      // Clear state and partial progress after completion
      setDownloadStates(prev => {
        const newStates = { ...prev, [code]: 'completed' as DownloadState };
        localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
        return newStates;
      });
      
      const finalProgress = localStorage.getItem(PARTIAL_PROGRESS_KEY);
      const finalPartial = finalProgress ? JSON.parse(finalProgress) : {};
      delete finalPartial[code];
      localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(finalPartial));
      
      delete abortControllers.current[code];
      
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[code];
          return newProgress;
        });
        setDownloadStates(prev => {
          const newStates = { ...prev };
          delete newStates[code];
          localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
          return newStates;
        });
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage === 'Download paused') {
        // Save paused state
        setDownloadStates(prev => {
          const newStates = { ...prev, [code]: 'paused' as DownloadState };
          localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
          return newStates;
        });
      } else {
        console.error('Failed to download language:', error);
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[code];
          return newProgress;
        });
        setDownloadStates(prev => {
          const newStates = { ...prev };
          delete newStates[code];
          localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
          return newStates;
        });
        
        // Clear partial progress on error
        const errorProgress = localStorage.getItem(PARTIAL_PROGRESS_KEY);
        const errorPartial = errorProgress ? JSON.parse(errorProgress) : {};
        delete errorPartial[code];
        localStorage.setItem(PARTIAL_PROGRESS_KEY, JSON.stringify(errorPartial));
        
        delete abortControllers.current[code];
        throw error;
      }
    }
  };

  const pauseDownload = (code: string) => {
    const controller = abortControllers.current[code];
    if (controller) {
      controller.abort();
    }
  };

  const resumeDownload = async (code: string, onProgress?: (progress: number) => void) => {
    return downloadLanguage(code, onProgress);
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
    downloadProgress,
    downloadStates,
    pauseDownload,
    resumeDownload
  };
}
