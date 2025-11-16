import type { FieldStore, FieldStoreState } from "@/context/FieldStore";
import type { Field, FilterName, FilterTypeKey, FilterTypeMap, PrimitiveFilterDictionary } from "@/field";
import { createContext, useContext } from "react";

export interface RegisteredField<TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]> extends Field<TKey, TValue> {
  defaultValue: TValue;
  updatedAt: number;
}

export type GenericRegisteredField = {
  [K in FilterTypeKey]: RegisteredField<K, FilterTypeMap[K]>;
}[FilterTypeKey];

export type RegisteredFieldDictionary = Map<FilterName, GenericRegisteredField>;

export interface SearchBuilderContextState {
  store: FieldStore;
  submitOnChange: boolean;
  isLoading: boolean;
  checkIsReady: () => boolean;
  refresh: (params: PrimitiveFilterDictionary) => void;
}

export interface SearchStoreState {
  state: FieldStoreState;
}

export const SearchBuilderContext = createContext<SearchBuilderContextState | undefined>(undefined);
export const SearchFieldsStoreContext = createContext<SearchStoreState | undefined>(undefined);

export const useSearchBuilder = (): SearchBuilderContextState => {
  const context = useContext(SearchBuilderContext);

  if (!context) {
    throw new Error("useSearchEngine must be used within a SearchBuilder");
  }

  return context;
};

export const useSearchStore = (): SearchStoreState => {
  const context = useContext(SearchFieldsStoreContext);

  if (!context) {
    throw new Error("useSearchFieldsStore must be used within a SearchBuilder");
  }

  return context;
};
