/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { SearchEngineContext } from "@/context";
import { createFieldsStore, FieldStore } from "@/context/fieldStore";
import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import { UrlPersistenceAdapter } from "@/persistence/UrlPersistenceAdapter";
import type { Field, FilterName, FilterValue, PersistenceMode, SearchParams, SerializedFilterDictionary, SerializedValue } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

export type SearchEngineContextProviderProps<P extends SearchParams> = {
  children: ReactNode;
  loading: boolean;
  persistence?: PersistenceMode;
  manualStart?: boolean;
  autoStartDelay?: number;
  submitOnChange?: boolean;
  onSearch?: (params: P) => void;
  onChange?: (params: P) => void;
};

export function SearchBuilder<P extends SearchParams>({
  children,
  loading,
  persistence,
  manualStart,
  autoStartDelay = 200,
  submitOnChange,
  onSearch,
  onChange,
}: SearchEngineContextProviderProps<P>) {
  const autostarted = useRef(false);
  const storeInstance = useRef<FieldStore | null>(null);
  const persistenceAdapter = useMemo(() => resolverPersistenceAdapter(persistence), [persistence]);

  if (!storeInstance.current) {
    storeInstance.current = createFieldsStore(persistenceAdapter?.read() ?? {});
  }

  const store = storeInstance.current;
  const { fields, touched: touchedFieldNames } = useSyncExternalStore(store.subscribe, store.state, store.state);
  const values: P = useMemo(() => collect(fields, (field) => field.value), [fields]);
  const isAutostartable = !autostarted.current && !manualStart;

  useEffect(() => {
    onChange?.(values);

    if (!submitOnChange || isAutostartable) {
      return;
    }

    if (!touchedFieldNames.some((name) => fields[name]?.submittable)) {
      return;
    }

    dispatch(values);
  }, [values, submitOnChange]);

  useEffect(() => {
    if (!isAutostartable) {
      return;
    }

    const timmer = setTimeout(() => {
      dispatch(values);
      autostarted.current = true;
    }, autoStartDelay);

    return () => clearTimeout(timmer);
  }, [values, autoStartDelay]);

  useEffect(() => {
    if (!persistenceAdapter?.subscribe) {
      return;
    }

    const handleExternalUpdate = () => {
      const newValues = persistenceAdapter.read();
      const currentFields = store.rehydrate(newValues);

      if (!currentFields || submitOnChange) {
        return;
      }

      onSearch?.(collect(currentFields, (field) => field.value));
    };

    const unsubscribe = persistenceAdapter.subscribe(handleExternalUpdate);

    return () => unsubscribe();
  }, [persistenceAdapter, store]);

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
    onSearch?.(values);
    persistenceAdapter?.write(createSerializeDictionaryFrom(fields));
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

function collect<N extends FilterName, V extends SerializedValue | FilterValue, R = Record<N, V>>(
  fields: Record<FilterName, Field<FilterValue, SerializedValue>>,
  resolve: (field: (typeof fields)[keyof typeof fields]) => V | undefined
): R {
  return Object.values(fields).reduce((acc, field) => {
    const value = resolve(field);

    if (!value) {
      return acc;
    }

    return {
      ...acc,
      [field.name]: value,
    };
  }, {} as R);
}

function createSerializeDictionaryFrom<N extends FilterName>(
  fields: Record<N, Field<FilterValue, SerializedValue>>
): SerializedFilterDictionary {
  return collect(fields, (field) => (field.serialize ? field.serialize(field.value) : (field.value as SerializedValue | undefined)));
}
export default SearchBuilder;
