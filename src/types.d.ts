/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type translations from "@/config/translations";
import type { FieldsCollection } from "@/context/FieldsCollection";
import type { Paths } from "@/internal";

export type FilterName = string;
type InputValue = null | string | FilterName | boolean | Date | Record<FilterName, unknown>;
export type InputSize = "small" | "medium";
export type FilterLabel = string;
export type FilterValue = null | InputValue | InputValue[];
export type FilterMetaData = { label: FilterLabel; description?: string };
export type FilterContext = FilterLabel | FilterMetaData;
export type FilterElement<T extends FilterName> = FilterMetaData & { value: T };
export type FilterBag<N extends FilterName> = Record<N, FilterContext>;
export type FilterDictionary<N extends FilterName> = Record<N, FilterElement<N>>;
export type PrimitiveFilterDictionary = Record<FilterName, PrimitiveValue>;
export type ValueFilterDictionary = Record<FilterName, FilterValue>;
export type PrimitiveValue = null | string | string[];

export interface PlainFilterChip {
  label: FilterLabel;
}

export interface IndexedFilterChip<V extends InputValue[] = InputValue[]> extends PlainFilterChip {
  value: V[number];
}

export type InferHumanizeReturn<V extends FilterValue> = V extends (infer T extends InputValue)[] ? IndexedFilterChip<T[]>[] : FilterLabel;
export type InferSerializeReturn<V extends FilterValue> = V extends InputValue[] ? string[] : string;

export interface FieldOptions {
  submittable?: boolean;
}

export interface Field<
  V extends FilterValue = FilterValue,
  P extends PrimitiveValue = InferSerializeReturn<V>,
  H extends InferHumanizeReturn<V> = InferHumanizeReturn<V>
> extends FieldOptions {
  name: FilterName;
  value: V;
  humanize?: (value: V, fields: FieldsCollection) => H;
  serialize?: (value: V) => P;
  unserialize?: (value: P) => V;
}

export type FieldDictionary = Record<FilterName, Field<FilterValue, PrimitiveValue>>;
export type SearchParams = Partial<Record<FilterName, FilterValue>>;
export type Locale = keyof typeof translations;

export type TranslationStrings = {
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
