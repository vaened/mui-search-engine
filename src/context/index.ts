/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";
import type { FieldStore } from "@/context/FieldStore";
import type { Field, FilterName, FilterValue, PrimitiveValue, SearchParams } from "@/types";
import { createContext, useContext } from "react";

export type RegisteredField<V extends FilterValue = FilterValue, P extends PrimitiveValue = PrimitiveValue> = Field<V, P> &
  Readonly<{
    defaultValue: V;
  }>;

export type RegisteredFieldDictionary<V extends FilterValue = FilterValue, P extends PrimitiveValue = PrimitiveValue> = Map<
  FilterName,
  RegisteredField<V, P>
>;

export interface SearchEngineContextState<P extends SearchParams = SearchParams> {
  store: FieldStore;
  submitOnChange: boolean;
  values: P;
  fields: FieldsCollection;
  isLoading: boolean;
  refresh: (params: P) => void;
}

export const SearchEngineContext = createContext<SearchEngineContextState | undefined>(undefined);

export const useSearchEngine = (): SearchEngineContextState => {
  const context = useContext(SearchEngineContext);

  if (!context) {
    throw new Error("useSearchEngine must be used within a SearchBuilder");
  }

  return context;
};
