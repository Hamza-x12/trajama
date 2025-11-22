import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Languages, Copy, Check, Download, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface TextRegion {
  text: string;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  label: string;
}

interface ImageOCRViewerProps {
  imageData: string;
  textRegions: TextRegion[];
  targetLanguages: string[];
  uiLanguage: string;
  onClose: () => void;
}

export const ImageOCRViewer = ({
  imageData,
  textRegions,
  targetLanguages,
  uiLanguage,
  onClose,
}: ImageOCRViewerProps) => {
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [translatingRegion, setTranslatingRegion] = useState<number | null>(null);
  const [regionTranslations, setRegionTranslations] = useState<Record<number, any>>({});
  const [copiedRegion, setCopiedRegion] = useState<number | null>(null);
  const [failedRegions, setFailedRegions] = useState<Set<number>>(new Set());
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const translateRegion = useCallback(async (index: number, retryCount = 0): Promise<boolean> => {
    try {
      const region = textRegions[index];
      const { data, error } = await supabase.functions.invoke('translate-image', {
        body: {
          imageData: '',
          targetLanguages,
          uiLanguage,
          textOnly: region.text,
        }
      });

      if (error) {
        // Handle rate limiting with exponential backoff
        if (error.message.includes('429') && retryCount < 3) {
          const delay = 1000 * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return translateRegion(index, retryCount + 1);
        }
        throw error;
      }

      if (data && data.translations) {
        setRegionTranslations(prev => ({
          ...prev,
          [index]: data.translations
        }));
        setFailedRegions(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Region translation error:', error);
      setFailedRegions(prev => new Set(prev).add(index));
      return false;
    }
  }, [textRegions, targetLanguages, uiLanguage]);

  const handleRegionClick = async (index: number) => {
    setSelectedRegion(index);

    // If already translated, don't translate again
    if (regionTranslations[index]) {
      return;
    }

    setTranslatingRegion(index);
    const success = await translateRegion(index);
    
    if (success) {
      toast.success('Region translated successfully');
    } else {
      toast.error('Failed to translate region');
    }
    
    setTranslatingRegion(null);
  };

  const handleBatchTranslate = async () => {
    const untranslatedRegions = textRegions
      .map((_, idx) => idx)
      .filter(idx => !regionTranslations[idx] && !failedRegions.has(idx));

    if (untranslatedRegions.length === 0) {
      toast.info('All regions already translated');
      return;
    }

    setIsProcessingBatch(true);
    setBatchProgress(0);
    
    for (let i = 0; i < untranslatedRegions.length; i++) {
      const regionIdx = untranslatedRegions[i];
      setTranslatingRegion(regionIdx);
      await translateRegion(regionIdx);
      setBatchProgress(((i + 1) / untranslatedRegions.length) * 100);
      
      // Add delay between requests to avoid rate limiting
      if (i < untranslatedRegions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setTranslatingRegion(null);
    setIsProcessingBatch(false);
    setBatchProgress(0);
    toast.success('Batch translation complete!');
  };

  const handleRetryFailed = async () => {
    if (failedRegions.size === 0) return;

    setIsProcessingBatch(true);
    const failed = Array.from(failedRegions);
    
    for (let i = 0; i < failed.length; i++) {
      setTranslatingRegion(failed[i]);
      await translateRegion(failed[i]);
      
      if (i < failed.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setTranslatingRegion(null);
    setIsProcessingBatch(false);
    toast.success('Retry complete');
  };

  const handleCopyRegion = (index: number, translationKey: string) => {
    const translation = regionTranslations[index]?.[translationKey];
    if (translation) {
      navigator.clipboard.writeText(translation);
      setCopiedRegion(index);
      toast.success(t('translation.copied'));
      setTimeout(() => setCopiedRegion(null), 2000);
    }
  };

  const handleCopyAll = () => {
    if (!regionTranslations[selectedRegion!]) return;
    
    const translations = regionTranslations[selectedRegion!];
    const text = Object.entries(translations)
      .map(([lang, trans]) => `${lang}: ${trans}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(text);
    toast.success('Copied all translations');
  };

  const handleExportAll = () => {
    const allData = textRegions.map((region, idx) => ({
      text: region.text,
      position: region.position,
      label: region.label,
      translations: regionTranslations[idx] || null,
      failed: failedRegions.has(idx)
    }));

    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-translations.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported translations');
  };

  const translatedCount = Object.keys(regionTranslations).length;
  const failedCount = failedRegions.size;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" />
              {t('translation.imageOCR') || 'Image OCR Analysis'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {translatedCount}/{textRegions.length} regions translated
              {failedCount > 0 && ` • ${failedCount} failed`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBatchTranslate}
              disabled={isProcessingBatch || translatedCount === textRegions.length}
            >
              {isProcessingBatch ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              Translate All ({textRegions.length - translatedCount - failedCount})
            </Button>
            {failedCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryFailed}
                disabled={isProcessingBatch}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry ({failedCount})
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportAll}
              disabled={translatedCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessingBatch && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <Progress value={batchProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Processing translations... {Math.round(batchProgress)}%
            </p>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Image with Overlays */}
          <Card className="relative overflow-auto p-4 bg-muted/20">
            <div className="relative inline-block max-w-full">
              <img
                src={imageData}
                alt="OCR Analysis"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ display: 'block' }}
              />
              
              {/* Text Region Overlays */}
              <div className="absolute inset-0">
                {textRegions.map((region, index) => (
                  <div
                    key={index}
                    onClick={() => handleRegionClick(index)}
                    onMouseEnter={() => setHoveredRegion(index)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`absolute cursor-pointer transition-all duration-200 ${
                      selectedRegion === index
                        ? 'bg-primary/30 border-2 border-primary ring-4 ring-primary/20'
                        : failedRegions.has(index)
                        ? 'bg-destructive/20 border-2 border-destructive'
                        : regionTranslations[index]
                        ? 'bg-green-500/20 border-2 border-green-500'
                        : hoveredRegion === index
                        ? 'bg-primary/20 border-2 border-primary/60'
                        : 'bg-primary/10 border border-primary/40 hover:bg-primary/15'
                    }`}
                    style={{
                      top: `${region.position.top}%`,
                      left: `${region.position.left}%`,
                      width: `${region.position.width}%`,
                      height: `${region.position.height}%`,
                    }}
                  >
                    <Badge 
                      className={`absolute -top-2 -left-2 text-xs ${
                        failedRegions.has(index)
                          ? 'bg-destructive'
                          : regionTranslations[index]
                          ? 'bg-green-500'
                          : selectedRegion === index
                          ? 'bg-primary'
                          : 'bg-primary/80'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                    {translatingRegion === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Region Details & Translations */}
          <Card className="p-6 overflow-auto">
            {selectedRegion === null ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Languages className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {t('translation.selectRegion') || 'Select a text region'}
                </p>
                <p className="text-sm mt-2">
                  Click on any region to translate it individually
                </p>
                <p className="text-sm mt-1 text-xs">
                  Or use "Translate All" to batch process
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                {/* Region Header */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {t('translation.region') || 'Region'} {selectedRegion + 1}
                      </Badge>
                      <Badge variant="secondary">
                        {textRegions[selectedRegion].label}
                      </Badge>
                      {regionTranslations[selectedRegion] && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Translated
                        </Badge>
                      )}
                      {failedRegions.has(selectedRegion) && (
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono bg-muted p-3 rounded-lg">
                      {textRegions[selectedRegion].text}
                    </p>
                  </div>
                  {regionTranslations[selectedRegion] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAll}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  )}
                </div>

                {/* Translations */}
                {regionTranslations[selectedRegion] ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      {t('translation.translations')}
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {Object.entries(regionTranslations[selectedRegion]).map(([lang, translation]) => (
                        <div
                          key={lang}
                          className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                                {lang}
                              </p>
                              <p className="text-sm">{translation as string}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyRegion(selectedRegion, lang)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedRegion === selectedRegion ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : translatingRegion === selectedRegion ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('translation.translating')}
                      </p>
                    </div>
                  </div>
                ) : failedRegions.has(selectedRegion) ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-destructive mb-2">
                      Translation failed for this region
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRegionClick(selectedRegion)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {t('translation.clickToTranslate') || 'Click to translate this region'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Region List */}
        <div className="mt-4 p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Badge variant="outline">{textRegions.length}</Badge>
            {t('translation.detectedRegions') || 'Detected Text Regions'}
          </h3>
          <div className="max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {textRegions.map((region, index) => (
                <Button
                  key={index}
                  variant={selectedRegion === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRegionClick(index)}
                  className={`gap-2 max-w-xs justify-start ${
                    failedRegions.has(index)
                      ? 'border-destructive text-destructive hover:bg-destructive/10'
                      : regionTranslations[index]
                      ? 'border-green-500 text-green-600 hover:bg-green-500/10'
                      : ''
                  }`}
                >
                  <Badge 
                    variant="secondary" 
                    className={`h-5 min-w-5 px-1 flex items-center justify-center shrink-0 ${
                      failedRegions.has(index)
                        ? 'bg-destructive text-destructive-foreground'
                        : regionTranslations[index]
                        ? 'bg-green-500 text-white'
                        : ''
                    }`}
                  >
                    {index + 1}
                  </Badge>
                  <span className="truncate">{region.text}</span>
                  {regionTranslations[index] && <Check className="h-3 w-3 shrink-0" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
