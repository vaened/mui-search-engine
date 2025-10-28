/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";

export type FilterName = string;
type InputValue = null | string | FilterName | boolean | Date | Record<FilterName, unknown>;
export type InputSize = "small" | "medium";
export type PersistenceMode = "url" | undefined;
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

type InferHumanizeReturn<V extends FilterValue> = V extends (infer T extends InputValue)[] ? IndexedFilterChip<T[]>[] : FilterLabel;
type InferSerializeReturn<V extends FilterValue> = V extends InputValue[] ? string[] : string;

export type Field<
  V extends FilterValue = FilterValue,
  P extends PrimitiveValue = InferSerializeReturn<V>,
  H extends InferHumanizeReturn<V> = InferHumanizeReturn<V>
> = {
  name: FilterName;
  value: V;
  submittable?: boolean;
  humanize?: (value: V, fields: FieldsCollection) => H;
  serialize?: (value: V) => P;
  unserialize?: (value: P) => V;
};

export type FieldDictionary = Record<FilterName, Field<FilterValue, PrimitiveValue>>;
export type SearchParams = Partial<Record<FilterName, FilterValue>>;
