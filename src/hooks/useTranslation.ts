/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngineConfig } from "@/config";
import type { TranslationKey } from "@/types";
import { useMemo } from "react";

export type TranslationValue = {
  text?: string;
  params?: Record<string, string>;
  fallback?: string;
};

export function useTranslation(label: TranslationKey, value: TranslationValue = {}): string | undefined {
  const { translate } = useSearchEngineConfig();
  const { text, params, fallback } = value;

  return useMemo(() => text ?? translate(label, { defaultValue: fallback, params }), [label, text, params, fallback]);
}
