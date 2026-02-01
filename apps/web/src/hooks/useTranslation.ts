import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/utils/translations';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  
  const t = (key: TranslationKey): string => {
    const bucket = translations[language] as Record<string, string>;
    return bucket[key] ?? translations.fr[key] ?? translations.ar[key] ?? key;
  };

  return { t, language };
}
