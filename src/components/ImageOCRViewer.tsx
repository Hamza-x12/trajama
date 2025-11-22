import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Languages, Copy, Check } from "lucide-react";
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

  const handleRegionClick = async (index: number) => {
    setSelectedRegion(index);

    // If already translated, don't translate again
    if (regionTranslations[index]) {
      return;
    }

    setTranslatingRegion(index);

    try {
      const region = textRegions[index];
      const { data, error } = await supabase.functions.invoke('translate-image', {
        body: {
          imageData: '', // No need to send image again
          targetLanguages,
          uiLanguage,
          textOnly: region.text,
        }
      });

      if (error) throw error;

      if (data && data.translations) {
        setRegionTranslations(prev => ({
          ...prev,
          [index]: data.translations
        }));
      }
    } catch (error) {
      console.error('Region translation error:', error);
      toast.error('Failed to translate this region');
    } finally {
      setTranslatingRegion(null);
    }
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
              {t('translation.clickRegions') || 'Click on text regions to translate them individually'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

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
                        selectedRegion === index ? 'bg-primary' : 'bg-primary/80'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                    {translatingRegion === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
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
                  {t('translation.clickAnyRegion') || 'Click on any highlighted region in the image to see its translation'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                {/* Region Header */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {t('translation.region') || 'Region'} {selectedRegion + 1}
                      </Badge>
                      <Badge variant="secondary">
                        {textRegions[selectedRegion].label}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono bg-muted p-3 rounded-lg">
                      {textRegions[selectedRegion].text}
                    </p>
                  </div>
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
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('translation.translating')}
                      </p>
                    </div>
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
          <div className="flex flex-wrap gap-2">
            {textRegions.map((region, index) => (
              <Button
                key={index}
                variant={selectedRegion === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleRegionClick(index)}
                className="gap-2"
              >
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                {region.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
