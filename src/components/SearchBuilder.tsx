import { SearchEngineContext } from "@/context";
import { createFieldsStore } from "@/context/fieldStore";
import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import { UrlPersistenceAdapter } from "@/persistence/UrlPersistenceAdapter";
import type { FilterValue, PersistenceMode, RegisteredField, SearchParams, SerializedFilterDictionary, SerializedValue } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

export type SearchEngineContextProviderProps<P extends SearchParams> = {
  children: ReactNode;
  loading: boolean;
  persistence?: PersistenceMode;
  manualStart?: boolean;
  autoStartDelay?: number;
  onSearch?: (params: P) => void;
  onChange?: (params: P) => void;
};

export function SearchBuilder<P extends SearchParams>({
  children,
  loading,
  persistence,
  manualStart,
  autoStartDelay = 200,
  onSearch,
  onChange,
}: SearchEngineContextProviderProps<P>) {
  const autostarted = useRef(false);

  const persistenceAdapter = useMemo(() => resolverPersistenceAdapter(persistence), [persistence]);
  const store = useMemo(() => createFieldsStore(persistenceAdapter?.read() ?? {}), [persistenceAdapter]);
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
      dispatch(values);
      autostarted.current = true;
    }, autoStartDelay);

    return () => clearTimeout(timmer);
  }, [values, autoStartDelay, onSearch]);

  useEffect(() => {
    onChange?.(values);
  }, [values]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(values);
  }

  function resolverPersistenceAdapter(mode: PersistenceMode): PersistenceAdapter | null {
    switch (true) {
      case mode === "url":
        return new UrlPersistenceAdapter();
      case mode === undefined:
        return null;
    }

    throw new Error("Unsupported persistence mode");
  }

  function refresh(params: SearchParams) {
    dispatch(params as P);
  }

  function dispatch(values: P) {
    if (persistenceAdapter) {
      const serialized = Object.entries<RegisteredField<FilterValue, SerializedValue>>(fields).reduce((acc, [name, field]) => {
        const serialize = field.serialize ?? ((value) => value as SerializedValue | undefined);
        const value = serialize(field.value);

        if (value === undefined) {
          return acc;
        }

        return {
          ...acc,
          [name]: value,
        };
      }, {} as SerializedFilterDictionary);

      persistenceAdapter.write(serialized);
    }

    onSearch?.(values);
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
