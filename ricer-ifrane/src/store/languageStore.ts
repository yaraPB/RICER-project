import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'ar' | 'fr';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ricer-language',
    }
  )
);
