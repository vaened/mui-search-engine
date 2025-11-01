/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";
import type { FieldStore, FieldStoreState } from "@/context/FieldStore";
import type { Field, FilterName, FilterValue, PrimitiveFilterDictionary, PrimitiveValue } from "@/types";
import { createContext, useContext } from "react";

export type Events = {
  submit: FieldsCollection;
  change: FieldStoreState;
};

export type RegisteredField<V extends FilterValue = FilterValue, P extends PrimitiveValue = PrimitiveValue> = Readonly<Field<V, P>> &
  Readonly<{
    defaultValue: V;
    updatedAt: number;
  }>;

export type RegisteredFieldDictionary<V extends FilterValue = FilterValue, P extends PrimitiveValue = PrimitiveValue> = Map<
  FilterName,
  RegisteredField<V, P>
>;

export interface SearchBuilderContextState {
  store: FieldStore;
  submitOnChange: boolean;
  isLoading: boolean;
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
