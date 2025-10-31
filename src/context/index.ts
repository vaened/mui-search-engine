/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "@/context/FieldsCollection";
import type { FieldOperation, FieldStore } from "@/context/FieldStore";
import type { Field, FilterName, FilterValue, PrimitiveFilterDictionary, PrimitiveValue, ValueFilterDictionary } from "@/types";
import { createContext, useContext } from "react";

export type Events = {
  submit: FieldsCollection;
  change: {
    fields: FieldsCollection;
    operation: FieldOperation;
  };
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

export interface SearchEngineContextState {
  store: FieldStore;
  submitOnChange: boolean;
  isLoading: boolean;
  refresh: (params: PrimitiveFilterDictionary) => void;
}

export const SearchEngineContext = createContext<SearchEngineContextState | undefined>(undefined);

export const useSearchEngine = (): SearchEngineContextState => {
  const context = useContext(SearchEngineContext);

  if (!context) {
    throw new Error("useSearchEngine must be used within a SearchBuilder");
  }

  return context;
};
