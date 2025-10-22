/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

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
export type SerializedFilterDictionary = Record<FilterName, SerializedValue>;

export interface PlainFilterChip {
  label: FilterLabel;
}

export interface IndexedFilterChip extends PlainFilterChip {
  name: FilterName;
}

export type HumanizedValue<V extends FilterValue> = V extends unknown[] ? IndexedFilterChip[] : PlainFilterChip;
export type SerializedValue = null | string | string[];

export interface RegisteredField<V extends FilterValue, S extends SerializedValue> {
  name: FilterName;
  value: V;
  humanize?: (value: V) => HumanizedValue<V>;
  serialize?: (value: V) => S | null;
  unserialize?: (value: S) => V;
}

export type FieldDictionary = Record<FilterName, RegisteredField<FilterValue>>;
export type SearchParams = Partial<Record<FilterName, FilterValue>>;
