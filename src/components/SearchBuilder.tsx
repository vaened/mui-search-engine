/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { SearchEngineContext } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { FieldStore } from "@/context/FieldStore";
import type { PrimitiveFilterDictionary } from "@/types";
import Grid from "@mui/material/Grid";
import React, { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

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

  const isAutostartable = !autostarted.current && !manualStart;

  useEffect(() => {
    const unsubscribe = store.onFieldChange(({ collection: fields, operation: lastOperation, touched: touchedFieldNames }) => {
      onChange?.(fields);

      const isSubmittableOperation = ["sync", "reset", "set"].includes(lastOperation ?? "");
      const isSubmittableTouched = touchedFieldNames.some((name) => fields.get(name)?.submittable);
      const isAutoSubmitEnable = !isAutostartable && (submitOnChange || isSubmittableTouched);
      const canBeSubmitted = isSubmittableOperation && isAutoSubmitEnable;

      if (!canBeSubmitted) {
        return;
      }

      dispatch(fields);
    });

    return () => unsubscribe();
  }, [submitOnChange, isAutostartable]);

  useEffect(() => {
    if (!isAutostartable) {
      return;
    }

    const timmer = setTimeout(() => {
      dispatch(store.collection());
      autostarted.current = true;
    }, autoStartDelay);

    return () => clearTimeout(timmer);
  }, [store.collection(), autoStartDelay]);

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

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      dispatch(store.collection());
    },
    [store.collection()]
  );

  const refresh = useCallback((dictionary: PrimitiveFilterDictionary) => {
    const newFields = store.rehydrate(dictionary);

    if (!newFields) {
      return;
    }

    onSearch?.(newFields);
  }, []);

  const dispatch = useCallback(
    (values: FieldsCollection) => {
      onSearch?.(values);
      store.persist();
    },
    [store]
  );

  const value = useMemo(
    () => ({
      store,
      isLoading: loading,
      submitOnChange,
      refresh,
    }),
    [store, loading, submitOnChange, refresh]
  );

  return (
    <SearchEngineContext.Provider value={value}>
      <Grid component="form" onSubmit={onSubmit} spacing={2} container>
        {children}
      </Grid>
    </SearchEngineContext.Provider>
  );
}

export default SearchBuilder;
