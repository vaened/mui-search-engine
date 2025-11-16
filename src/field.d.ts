/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";

export type FilterName = string;
export type FilterLabel = string;
export type ArrayItemType<T> = T extends (infer U)[] ? U : never;
export type FilterMultiLabel<T> = { value: ArrayItemType<T>; label: string }[];
export type ValueOf<T> = T extends { value: infer V } ? V : never;

export type FilterMetaData = { label: FilterLabel; description?: string };
export type FilterContext = FilterLabel | FilterMetaData;
export type FilterElement<T extends FilterName> = FilterMetaData & { value: T };
export type FilterBag<N extends FilterName> = Record<N, FilterContext>;
export type FilterDictionary<N extends FilterName> = Record<N, FilterElement<N>>;

export type FilterTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  date: Date;
  object: object;
  "string[]": string[];
  "number[]": number[];
  "boolean[]": boolean[];
  "date[]": Date[];
  "object[]": object[];
};
export type ScalarFilterTypeMap = {
  [K in keyof FilterTypeMap as K extends `${string}[]` ? never : K]: FilterTypeMap[K];
};
export type ArrayFilterTypeMap = {
  [K in keyof FilterTypeMap as K extends `${string}[]` ? K : never]: FilterTypeMap[K];
};

export type FilterTypeKey = keyof FilterTypeMap;
export type ScalarTypeKey = Exclude<FilterTypeKey, `${string}[]`>;
export type ArrayTypeKey = Extract<FilterTypeKey, `${string}[]`>;

export type FilterValue = FilterTypeMap[FilterTypeKey];
export type ScalarFilterValue = ScalarFilterTypeMap[keyof ScalarFilterTypeMap];
export type ArrayFilterValue = ArrayFilterTypeMap[keyof ArrayFilterTypeMap];

export type HumanizeReturnType<T> = T extends unknown[] ? FilterMultiLabel<T>[] : string;
export type SerializeReturnType<T> = T extends unknown[] ? string[] : string;

export interface PlainFilterChip {
  label: FilterLabel;
}
export interface IndexedFilterChip<TValue extends ArrayFilterValue = ArrayFilterValue> extends PlainFilterChip {
  value: TValue[number];
}

export type PrimitiveValue = string | string[];
export type HumanizedValue<V extends ArrayFilterValue> = string | ReadonlyArray<IndexedFilterChip<V>>;
export type PrimitiveFilterDictionary = Record<FilterName, PrimitiveValue>;
export type ValueFilterDictionary = Record<FilterName, FilterValue>;

export type Serializer<TValue> = {
  serialize(value: TValue): SerializeReturnType<TValue>;
  unserialize(value: SerializeReturnType<TValue>): NoInfer<TValue>;
};

export interface FieldOptions {
  submittable?: boolean;
}

export interface FieldConfig<TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]> extends FieldOptions {
  type: TKey;
  name: FilterName;
  humanize: (value: TValue, fields: FieldsCollection) => HumanizeReturnType<TValue>;
  serializer: Serializer<TValue>;
}

export type ScalarFieldConfig<TKey extends ScalarTypeKey, TValue extends FilterTypeMap[TKey]> = FieldOptions & {
  name: FilterName;
  type: TKey;
  humanize?: (value: TValue, fields: FieldsCollection) => string;
  serializer?: Serializer<TValue>;
};

export type ArrayFieldConfig<TKey extends ArrayTypeKey, TValue extends FilterTypeMap[TKey]> = FieldOptions & {
  name: FilterName;
  type: TKey;
  humanize?: (value: TValue, fields: FieldsCollection) => FilterMultiLabel<TValue>;
  serializer?: Serializer<TValue>;
};

export interface Field<TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]> extends FieldConfig<TKey, TValue> {
  value: TValue;
}

export interface ScalarField<TKey extends ScalarTypeKey, TValue extends FilterTypeMap[TKey]> extends ScalarFieldConfig<TKey, TValue> {
  value: TValue;
}

export interface ArrayField<TKey extends ArrayTypeKey, TValue extends FilterTypeMap[TKey]> extends ArrayFieldConfig<TKey, TValue> {
  value: TValue;
}

export type GenericField = {
  [K in FilterTypeKey]: Field<K, FilterTypeMap[K]>;
}[FilterTypeKey];
