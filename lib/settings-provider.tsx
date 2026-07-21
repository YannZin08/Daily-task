import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { monthsByLanguage, translations, type Language, type TranslationKey } from "@/lib/i18n/translations";

export type Currency = "BRL" | "USD";

const LANGUAGE_KEY = "appLanguage";
const CURRENCY_KEY = "appCurrency";

type SettingsContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (value: number) => string;
  months: string[];
  locale: string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");
  const [currency, setCurrencyState] = useState<Currency>("BRL");

  useEffect(() => {
    (async () => {
      try {
        const [[, storedLanguage], [, storedCurrency]] = await AsyncStorage.multiGet([
          LANGUAGE_KEY,
          CURRENCY_KEY,
        ]);
        if (storedLanguage === "pt" || storedLanguage === "en") {
          setLanguageState(storedLanguage);
        }
        if (storedCurrency === "BRL" || storedCurrency === "USD") {
          setCurrencyState(storedCurrency);
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      }
    })();
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next).catch((error) =>
      console.error("Erro ao salvar idioma:", error)
    );
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    AsyncStorage.setItem(CURRENCY_KEY, next).catch((error) =>
      console.error("Erro ao salvar moeda:", error)
    );
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? key,
    [language]
  );

  const formatCurrency = useCallback(
    (value: number) => {
      const safeValue = Number.isFinite(value) ? value : 0;
      if (currency === "USD") {
        return `$${safeValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
      return `R$ ${safeValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency]
  );

  const months = useMemo(() => monthsByLanguage[language], [language]);
  const locale = language === "pt" ? "pt-BR" : "en-US";

  const value = useMemo(
    () => ({ language, setLanguage, currency, setCurrency, t, formatCurrency, months, locale }),
    [language, setLanguage, currency, setCurrency, t, formatCurrency, months, locale]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
