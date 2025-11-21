import { useState, useEffect } from 'react';

export interface OfflineLanguage {
  code: string;
  name: string;
  downloaded: boolean;
  size?: string;
}

const OFFLINE_LANGUAGES_KEY = 'tarjama-offline-languages';

export function useOfflineLanguages() {
  const [offlineLanguages, setOfflineLanguages] = useState<OfflineLanguage[]>([
    { code: 'ar', name: 'Arabic', downloaded: false, size: '2.5 MB' },
    { code: 'fr', name: 'French', downloaded: false, size: '2.1 MB' },
    { code: 'dar', name: 'Darija', downloaded: false, size: '1.8 MB' },
    { code: 'en', name: 'English', downloaded: false, size: '2.3 MB' },
    { code: 'es', name: 'Spanish', downloaded: false, size: '2.2 MB' },
    { code: 'de', name: 'German', downloaded: false, size: '2.4 MB' },
    { code: 'it', name: 'Italian', downloaded: false, size: '2.0 MB' },
    { code: 'pt', name: 'Portuguese', downloaded: false, size: '2.1 MB' },
    { code: 'zh', name: 'Chinese', downloaded: false, size: '3.2 MB' },
    { code: 'ja', name: 'Japanese', downloaded: false, size: '2.8 MB' },
    { code: 'tr', name: 'Turkish', downloaded: false, size: '1.9 MB' },
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

  const downloadLanguage = async (code: string) => {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
  };

  const removeLanguage = (code: string) => {
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
    removeLanguage
  };
}
