/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import React, {
  cloneElement,
  ComponentProps,
  FormEventHandler,
  isValidElement,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SearchBuilderContext, SearchStateContext } from ".";
import type { PrimitiveFilterDictionary } from "../field";
import { useResolveFieldStoreInstance } from "../hooks/useResolveFieldStoreInstance";
import { CreateStoreOptions, FieldsCollection, FieldStore } from "../store";

type FormProps = {
  onSubmit?: FormEventHandler;
  children?: ReactNode;
  [key: string]: unknown;
};

export type SearchBuilderProviderProps = {
  children: ReactNode;
  store?: FieldStore;
  loading: boolean;
  manualStart?: boolean;
  autoStartDelay?: number;
  submitOnChange?: boolean;
  Container?: ReactElement<FormProps>;
  configuration?: CreateStoreOptions;
  onSearch?: (params: FieldsCollection) => void;
  onChange?: (params: FieldsCollection) => void;
} & Omit<ComponentProps<"form">, "onSubmit" | "onChange">;

function SearchStoreContextProvider({ store, children }: { store: FieldStore; children: ReactNode }) {
  const state = useSyncExternalStore(store.subscribe, store.state, store.state);
  return <SearchStateContext.Provider value={{ state }}>{children}</SearchStateContext.Provider>;
}

export function SearchBuilderProvider({
  children,
  store: source,
  loading,
  manualStart,
  autoStartDelay = 200,
  submitOnChange = false,
  configuration,
  Container,
  onSearch,
  onChange,
  ...restOfProps
}: SearchBuilderProviderProps) {
  const autostarted = useRef(false);
  const isReady = useRef(manualStart === true);
  const store = useResolveFieldStoreInstance(source, configuration);

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
        {isValidElement(Container) ? (
          cloneElement(Container, { onSubmit }, children)
        ) : (
          <form onSubmit={onSubmit} {...restOfProps}>
            {children}
          </form>
        )}
      </SearchStoreContextProvider>
    </SearchBuilderContext.Provider>
  );
}

export default SearchBuilderProvider;
