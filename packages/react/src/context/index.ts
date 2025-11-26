import { createContext, useContext } from "react";
import type { Field, FilterName, FilterTypeKey, FilterTypeMap, PrimitiveFilterDictionary } from "../field";
import type { FieldStore, FieldStoreState } from "./FieldStore";

export interface RegisteredField<TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]> extends Field<TKey, TValue> {
  defaultValue: TValue | null;
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

export interface SearchState {
  state: FieldStoreState;
}

export const SearchBuilderContext = createContext<SearchBuilderContextState | undefined>(undefined);
export const SearchStateContext = createContext<SearchState | undefined>(undefined);

export const useSearchBuilder = (): SearchBuilderContextState => {
  const context = useContext(SearchBuilderContext);

  if (!context) {
    throw new Error("useSearchBuilder must be used within a SearchBuilder");
  }

  return context;
};

export const useSearchState = (): SearchState => {
  const context = useContext(SearchStateContext);

  if (!context) {
    throw new Error("useSearchState must be used within a SearchBuilder");
  }

  return context;
};
