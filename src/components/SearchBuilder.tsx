/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { SearchEngineContext } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { createFieldsStore } from "@/context/FieldStore";
import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import { UrlPersistenceAdapter } from "@/persistence/UrlPersistenceAdapter";
import type { PersistenceMode, PrimitiveFilterDictionary } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

export type SearchEngineContextProviderProps = {
  children: ReactNode;
  loading: boolean;
  persistence?: PersistenceMode;
  manualStart?: boolean;
  autoStartDelay?: number;
  submitOnChange?: boolean;
  onSearch?: (params: FieldsCollection) => void;
  onChange?: (params: FieldsCollection) => void;
};

export function SearchBuilder({
  children,
  loading,
  persistence,
  manualStart,
  autoStartDelay = 200,
  submitOnChange = false,
  onSearch,
  onChange,
}: SearchEngineContextProviderProps) {
  const autostarted = useRef(false);
  const persistenceAdapter = useMemo(() => resolverPersistenceAdapter(persistence), [persistence]);
  const store = useSingleton(() => createFieldsStore(persistenceAdapter?.read() ?? {}));

  const {
    collection: fields,
    touched: touchedFieldNames,
    operation: lastOperation,
  } = useSyncExternalStore(store.subscribe, store.state, store.state);
  const values = useMemo(() => fields.toValues(), [fields]);
  const isAutostartable = !autostarted.current && !manualStart;

  useEffect(() => {
    onChange?.(fields);
    store.emit("change", { fields, operation: lastOperation });

    if (lastOperation !== "reset" && (isAutostartable || !touchedFieldNames.some((name) => fields.get(name)?.submittable))) {
      return;
    }

    dispatch(fields);
  }, [fields]);

  useEffect(() => {
    if (!isAutostartable) {
      return;
    }

    const timmer = setTimeout(() => {
      dispatch(fields);
      autostarted.current = true;
    }, autoStartDelay);

    return () => clearTimeout(timmer);
  }, [fields, autoStartDelay]);

  useEffect(() => {
    if (!persistenceAdapter?.subscribe) {
      return;
    }

    const handleExternalUpdate = () => {
      const newValues = persistenceAdapter.read();
      const newFields = store.rehydrate(newValues);

      if (!newFields || submitOnChange) {
        return;
      }

      onSearch?.(newFields);
    };

    const unsubscribe = persistenceAdapter.subscribe(handleExternalUpdate);

    return () => unsubscribe();
  }, [persistenceAdapter, store]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(fields);
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

  function refresh(dictionary: PrimitiveFilterDictionary) {
    const newFields = store.rehydrate(dictionary);

    if (!newFields) {
      return;
    }

    onSearch?.(newFields);
  }

  function dispatch(values: FieldsCollection) {
    onSearch?.(values);
    store.emit("submit", values);
    persistenceAdapter?.write(fields.toPrimitives());
  }

  return (
    <SearchEngineContext.Provider
      value={{
        store,
        submitOnChange,
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

function useSingleton<T>(factory: () => T): T {
  const ref = useRef<T | null>(null);

  if (!ref.current) {
    ref.current = factory();
  }

  return ref.current;
}

export default SearchBuilder;
