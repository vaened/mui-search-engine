/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { Paths, PathValue } from "@/internal";
import type { IconSet, Locale, TranslationKey, TranslationStrings } from "@/types";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { default as iconsSet } from "./icons";
import { default as translations } from "./translations";

export type TranslateOptions<D extends string | undefined> = {
  text?: string;
  params?: Record<string, string>;
  fallback: D;
};

export type Translator = (key: TranslationKey, options?: TranslateOptions<string | undefined>) => string | undefined;

export type SearchEngineConfigContextState = {
  icon: (key: keyof IconSet) => ReactNode;
  translate: Translator;
};

export type SearchEngineConfigProviderProps = {
  children: ReactNode;
  locale?: Locale;
  translation?: TranslationStrings;
  icons?: Partial<IconSet>;
};

function translateFrom(
  translation: TranslationStrings,
  key: TranslationKey,
  options?: TranslateOptions<string | undefined>
): string | undefined {
  const label = getByPath(translation, key);

  if (!label) {
    return options?.fallback;
  }

  return options?.params ? label.replace(/\{(\w+)\}/g, (_, k) => String(options.params?.[k] ?? "")) : label;
}

export const SearchEngineConfigContext = createContext<SearchEngineConfigContextState>({
  icon: (key: keyof IconSet) => iconsSet[key],
  translate: (key: TranslationKey, options?: TranslateOptions<string | undefined>) => {
    return translateFrom(translations["en"], key, options);
  },
});

export const useSearchEngineConfig = () => useContext(SearchEngineConfigContext);

export function SearchEngineConfigProvider({
  locale,
  translation: labels,
  icons: userIcons,
  children,
}: SearchEngineConfigProviderProps): React.ReactElement {
  const [translation, setTraslation] = useState<TranslationStrings>(() => {
    return labels ?? translations[locale ?? "en"];
  });
  const [availableIcons, setAvailableIcons] = useState<IconSet>(() => ({
    ...iconsSet,
    ...userIcons,
  }));

  useEffect(() => {
    setTraslation(labels ?? translations[locale ?? "en"]);
  }, [locale, translations]);

  useEffect(() => {
    setAvailableIcons({ ...iconsSet, ...userIcons });
  }, [userIcons]);

  function icon(key: keyof IconSet): ReactNode {
    return availableIcons[key];
  }

  function translate(key: TranslationKey, options?: TranslateOptions<string | undefined>): string | undefined {
    return translateFrom(translation, key, options);
  }

  return (
    <SearchEngineConfigContext.Provider
      value={{
        icon,
        translate,
      }}>
      {children}
    </SearchEngineConfigContext.Provider>
  );
}

function isIndexable(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function getByPath<T extends object, P extends Paths<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  let acc: unknown = obj;
  for (const key of path.split(".")) {
    if (isIndexable(acc) && key in acc) {
      acc = (acc as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return acc as PathValue<T, P> | undefined;
}
