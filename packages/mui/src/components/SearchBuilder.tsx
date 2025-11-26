/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import Grid from "@mui/material/Grid";
import type { FieldsCollection, PrimitiveFilterDictionary } from "@vaened/react-search-builder";
import { FieldStore, SearchBuilderContext, SearchFieldsStoreContext } from "@vaened/react-search-builder";
import React, { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

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

function SearchStoreContextProvider({ store, children }: { store: FieldStore; children: ReactNode }) {
  const state = useSyncExternalStore(store.subscribe, store.state, store.state);
  return <SearchFieldsStoreContext.Provider value={{ state }}>{children}</SearchFieldsStoreContext.Provider>;
}

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
  const isReady = useRef(manualStart === true);

  const checkIsReady = useCallback(() => isReady.current, []);
  const checkAutostartable = useCallback(() => !autostarted.current && !manualStart, [manualStart]);

  useEffect(() => {
    const unsubscribe = store.onFieldChange(({ collection: fields, operation: lastOperation, touched: touchedFieldNames }) => {
      onChange?.(fields);

      const isSubmittableOperation = ["sync", "reset", "set"].includes(lastOperation ?? "");
      const isSubmittableTouched = touchedFieldNames.some((name) => fields.get(name)?.submittable);
      const isAutoSubmitEnable = !checkAutostartable() && (submitOnChange || isSubmittableTouched);
      const canBeSubmitted = isSubmittableOperation && isAutoSubmitEnable;

      if (!canBeSubmitted) {
        return;
      }

      dispatch(fields);
    });

    return () => unsubscribe();
  }, [submitOnChange, checkAutostartable]);

  useEffect(() => {
    if (!checkAutostartable()) {
      isReady.current = true;
      return;
    }

    const timmer = setTimeout(() => {
      dispatch(store.collection());
      autostarted.current = true;
      isReady.current = true;
    }, autoStartDelay);

    return () => {
      clearTimeout(timmer);
      autostarted.current = false;
    };
  }, [store, autoStartDelay]);

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
      checkIsReady,
      refresh,
    }),
    [store, loading, submitOnChange, checkIsReady, refresh]
  );

  return (
    <SearchBuilderContext.Provider value={value}>
      <SearchStoreContextProvider store={store}>
        <Grid component="form" onSubmit={onSubmit} spacing={2} container>
          {children}
        </Grid>
      </SearchStoreContextProvider>
    </SearchBuilderContext.Provider>
  );
}

export default SearchBuilder;
