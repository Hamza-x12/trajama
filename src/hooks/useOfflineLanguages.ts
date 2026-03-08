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

export function useOfflineLanguages() {
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloadStates, setDownloadStates] = useState<{ [key: string]: DownloadState }>({});
  const abortControllers = useRef<{ [key: string]: AbortController }>({});

  // The m2m100 model is shared (~150MB total, downloaded once).
  // Each "language" just registers a pair; model files are cached after first download.
  const [offlineLanguages, setOfflineLanguages] = useState<OfflineLanguage[]>([
    { code: 'ar', name: 'Arabic', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'fr', name: 'French', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'dar', name: 'Darija', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'en', name: 'English', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'es', name: 'Spanish', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'de', name: 'German', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'it', name: 'Italian', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'pt', name: 'Portuguese', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'zh', name: 'Chinese', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'ja', name: 'Japanese', downloaded: false, size: '~150 MB (shared model)' },
    { code: 'tr', name: 'Turkish', downloaded: false, size: '~150 MB (shared model)' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_LANGUAGES_KEY);
    const storedStates = localStorage.getItem(DOWNLOAD_STATES_KEY);

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
  }, []);

  const langMap: Record<string, string> = {
    'ar': 'Arabic', 'fr': 'French', 'dar': 'Darija', 'en': 'English',
    'es': 'Spanish', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
    'zh': 'Chinese', 'ja': 'Japanese', 'tr': 'Turkish', 'ru': 'Russian',
    'ko': 'Korean', 'hi': 'Hindi'
  };

  const downloadLanguage = async (code: string, onProgress?: (progress: number) => void) => {
    try {
      const controller = new AbortController();
      abortControllers.current[code] = controller;

      setDownloadProgress(prev => ({ ...prev, [code]: 0 }));
      setDownloadStates(prev => {
        const newStates = { ...prev, [code]: 'downloading' as DownloadState };
        localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
        return newStates;
      });

      const { loadTranslationModel } = await import('@/utils/localTranslation');
      const langName = langMap[code] || code;

      // We track progress across multiple model file downloads.
      // Phase 1 (0-50%): load lang→English model
      // Phase 2 (50-100%): load English→lang model
      const makeProgressCb = (phaseOffset: number) => (progressData: any) => {
        if (controller.signal.aborted) return;
        if (progressData.status === 'downloading' && progressData.progress != null) {
          const total = phaseOffset + (progressData.progress / 100) * 50;
          const rounded = Math.round(total);
          setDownloadProgress(prev => ({ ...prev, [code]: rounded }));
          onProgress?.(rounded);
        } else if (progressData.status === 'loading') {
          const total = phaseOffset + 48;
          setDownloadProgress(prev => ({ ...prev, [code]: Math.round(total) }));
          onProgress?.(Math.round(total));
        } else if (progressData.status === 'ready') {
          const total = phaseOffset + 50;
          setDownloadProgress(prev => ({ ...prev, [code]: Math.round(total) }));
          onProgress?.(Math.round(total));
        }
      };

      if (controller.signal.aborted) throw new Error('Download paused');
      await loadTranslationModel(langName, 'English', makeProgressCb(0));

      if (controller.signal.aborted) throw new Error('Download paused');
      await loadTranslationModel('English', langName, makeProgressCb(50));

      // Mark complete
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

      setDownloadStates(prev => {
        const newStates = { ...prev, [code]: 'completed' as DownloadState };
        localStorage.setItem(DOWNLOAD_STATES_KEY, JSON.stringify(newStates));
        return newStates;
      });

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
