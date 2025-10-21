import { SearchEngineContext } from "@/context";
import { createFieldsStore } from "@/context/fieldStore";
import type { FilterValue, RegisteredField, SearchParams, SerializedValue } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

export type SearchEngineContextProviderProps<P extends SearchParams> = {
  children: ReactNode;
  loading: boolean;
  manualStart?: boolean;
  autoStartDelay?: number;
  onSearch?: (params: P) => void;
  onChange?: (params: P) => void;
};

export function SearchBuilder<P extends SearchParams>({
  children,
  loading,
  manualStart,
  autoStartDelay = 200,
  onSearch,
  onChange,
}: SearchEngineContextProviderProps<P>) {
  const autostarted = useRef(false);
  const store = useMemo(() => createFieldsStore(), []);
  const fields = useSyncExternalStore(store.subscribe, store.all, store.all);

  const values: P = useMemo(() => {
    return Object.entries<RegisteredField<FilterValue, SerializedValue>>(fields).reduce((acc, [name, field]) => {
      if (field.value === undefined) {
        return acc;
      }

      return {
        ...acc,
        [name]: field.value,
      };
    }, {} as P);
  }, [fields]);

  useEffect(() => {
    if (manualStart || autostarted.current) {
      return;
    }

    const timmer = setTimeout(() => {
      onSearch?.(values);
      autostarted.current = true;
    }, autoStartDelay);

    return () => clearTimeout(timmer);
  }, [values, autoStartDelay, onSearch]);

  useEffect(() => {
    onChange?.(values);
  }, [values]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(values);
  }

  function refresh(params: SearchParams) {
    onSearch?.(params as P);
  }

  return (
    <SearchEngineContext.Provider
      value={{
        store,
        fields,
        values,
        isLoading: loading,
        refresh,
      }}>
      <Grid component="form" onSubmit={onSubmit} spacing={2} container>
        {children}
      </Grid>
    </SearchEngineContext.Provider>
  );
}

export default SearchBuilder;
