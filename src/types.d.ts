/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";

type InputValue = string | number | boolean | Date | Record<FilterName, unknown>;
export type InputSize = "small" | "medium";
export type PersistenceMode = "url" | undefined;
export type FilterName = string;
export type FilterLabel = string;
export type FilterValue = null | InputValue | InputValue[];
export type FilterMetaData = { label: FilterLabel; description?: string };
export type FilterContext = FilterLabel | FilterMetaData;
export type FilterElement<T extends FilterName> = FilterMetaData & { value: T };
export type FilterBag<N extends FilterName> = Record<N, FilterContext>;
export type FilterDictionary<N extends FilterName> = Record<N, FilterElement<N>>;
export type PrimitiveFilterDictionary = Record<FilterName, PrimitiveValue>;
export type ValueFilterDictionary = Record<FilterName, FilterValue>;

export interface PlainFilterChip {
  label: FilterLabel;
}

export interface IndexedFilterChip<V extends InputValue[] = InputValue[]> extends PlainFilterChip {
  value: V[number];
}

export type HumanizedValue<V extends InputValue[] = InputValue[]> = IndexedFilterChip<V>[] | FilterLabel;
export type PrimitiveValue = null | string | string[];

export interface Field<V extends FilterValue, P extends PrimitiveValue> {
  name: FilterName;
  value: V;
  submittable?: boolean;
  humanize?: (value: V, fields: FieldsCollection) => HumanizedValue<Extract<V, InputValue[]>> | null | undefined;
  serialize?: (value: V) => P | null;
  unserialize?: (value: P) => V;
}

export type FieldDictionary = Record<FilterName, Field<FilterValue, PrimitiveValue>>;
export type SearchParams = Partial<Record<FilterName, FilterValue>>;
