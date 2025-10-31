/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { SearchEngineContext } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { FieldStore } from "@/context/FieldStore";
import type { PrimitiveFilterDictionary } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

export type SearchEngineContextProviderProps = {
  children: ReactNode;
  store: FieldStore;
  loading: boolean;
  manualStart?: boolean;
  autoStartDelay?: number;
  submitOnChange?: boolean;
  onSearch?: (params: FieldsCollection) => void;
  onChange?: (params: FieldsCollection) => void;
};

export function SearchBuilder({
  children,
  store,
  loading,
  manualStart,
  autoStartDelay = 200,
  submitOnChange = false,
  onSearch,
  onChange,
}: SearchEngineContextProviderProps) {
  const autostarted = useRef(false);

  const {
    collection: fields,
    touched: touchedFieldNames,
    operation: lastOperation,
  } = useSyncExternalStore(store.subscribe, store.state, store.state);
  const values = useMemo(() => fields.toValues(), [fields]);
  const isAutostartable = !autostarted.current && !manualStart;

  useEffect(() => {
    onChange?.(fields);

    const isSubmittableOperation = lastOperation === "reset";
    const isSubmittableTouched = touchedFieldNames.some((name) => fields.get(name)?.submittable);
    const isAutoSubmitEnable = !isAutostartable && (submitOnChange || isSubmittableTouched);
    const canBeSubmitted = isSubmittableOperation || isAutoSubmitEnable;

    if (!canBeSubmitted) {
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
    const handleExternalUpdate = (newFields: FieldsCollection | undefined) => {
      if (!newFields || submitOnChange) {
        return;
      }

      onSearch?.(newFields);
    };

    const unsubscribe = store.onPersistenceChange(handleExternalUpdate);

    return () => unsubscribe();
  }, [store]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(fields);
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
    store.persist();
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

export default SearchBuilder;
