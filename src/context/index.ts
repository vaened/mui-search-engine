import type { FieldStore } from "@/context/fieldStore";
import type { FilterName, FilterValue, RegisteredField, SearchParams, SerializedValue } from "@/types";
import { createContext, useContext } from "react";

export interface SearchEngineContextState<P extends SearchParams = SearchParams> {
  store: FieldStore;
  values: P;
  fields: Record<FilterName, RegisteredField<FilterValue, SerializedValue>>;
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
