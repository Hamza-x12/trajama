import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function SettingsLink() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 hover:scale-110 transition-transform duration-200"
      onClick={() => navigate('/settings')}
    >
      <Settings className="h-5 w-5 hover:rotate-90 transition-transform duration-500" />
      <span className="sr-only">{t('settings.title')}</span>
    </Button>
  );
}
