import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/utils/translations';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  
  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return { t, language };
}
