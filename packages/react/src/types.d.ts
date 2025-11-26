/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type translations from "@/config/translations";
import type { Paths } from "@/internal";

export type InputSize = "small" | "medium";

export type Locale = keyof typeof translations;

export type TranslationStrings = {
  global: {
    filtersLabel: string;
  };
  searchBar: {
    defaultLabel: string;
    searchAriaLabel: string;
  };
  indexSelect: {
    tooltip: string;
    defaultLabel: string;
    dropdownTitle: string;
  };
  flagsSelect: {
    tooltip: string;
    dropdownTitle: string;
    restartButton: string;
  };
  activeFiltersBar: {
    title: string;
    noFilters: string;
    clearAllTooltip: string;
    clearAllAriaLabel: string;
  };
};

export type IconSet = {
  searchBarSearchIcon: React.ReactNode;
  indexSelectMobileIcon: React.ReactNode;
  flagsFilterActiveIcon: React.ReactNode;
  flagsFilterInactiveIcon: React.ReactNode;
  flagsRestartIcon: React.ReactNode;
  activeFiltersClearAllIcon: React.ReactNode;
};

export type TranslationDictionary = Record<string, TranslationStrings>;
export type TranslationKey = Paths<TranslationStrings>;
