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
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SearchBuilderContext, SearchStateContext } from ".";
import type { PrimitiveFilterDictionary } from "../field";
import { useResolveFieldStoreInstance } from "../hooks/useResolveFieldStoreInstance";
import { CreateStoreOptions, FieldOperation, FieldsCollection, FieldStore, FieldStoreState } from "../store";
import { useReadyState } from "./useReadyState";

const SKIP_PERSISTENCE = false;

type FormProps = {
  onSubmit?: FormEventHandler;
  children?: ReactNode;
  [key: string]: unknown;
};

type SubmitResult = void | boolean;

export type SearchFormProps = {
  children: ReactNode;
  store?: FieldStore;
  loading?: boolean;
  manualStart?: boolean;
  autoStartDelay?: number;
  submitOnChange?: boolean;
  Container?: ReactElement<FormProps>;
  configuration?: CreateStoreOptions;
  onSearch?: (params: FieldsCollection) => SubmitResult | Promise<SubmitResult>;
  onChange?: (params: FieldsCollection) => void;
} & Omit<ComponentProps<"form">, "onSubmit" | "onChange">;

function SearchStateContextProvider({ store, children }: { store: FieldStore; children: ReactNode }) {
  const state = useSyncExternalStore(store.subscribe, store.state, store.state);
  return <SearchStateContext.Provider value={{ state }}>{children}</SearchStateContext.Provider>;
}

const forcedOperations: FieldOperation[] = ["reset", "flush"];

export function SearchForm({
  children,
  store: source,
  loading = false,
  manualStart,
  autoStartDelay = 200,
  submitOnChange = false,
  configuration,
  Container,
  onSearch,
  onChange,
  ...restOfProps
}: SearchFormProps) {
  const autostarted = useRef(false);
  const [isAutoLoading, setAutoLoadingStatus] = useState(false);

  const store = useResolveFieldStoreInstance(source, configuration);
  const isHydrating = useSyncExternalStore(store.subscribe, store.isHydrating, store.isHydrating);
  const { isFormReady, markTimmerAsCompleted } = useReadyState({ isReady: manualStart === true, isHydrating });

  const isLoading = isAutoLoading || loading || isHydrating;

  const checkAutostartable = useCallback(() => !autostarted.current && !manualStart, [manualStart]);

  useEffect(() => {
    if (!isFormReady) {
      return;
    }

    const unsubscribe = store.onFieldChange(({ collection, operation, touched, isHydrating }) => {
      if (operation === null) {
        return;
      }

      onChange?.(collection);
      resolution({ collection, touched, operation, isHydrating });
    });

    return () => unsubscribe();
  }, [submitOnChange, isFormReady]);

  useEffect(() => {
    if (!checkAutostartable()) {
      markTimmerAsCompleted();
      return;
    }

    const timer = setTimeout(() => {
      dispatch();
      autostarted.current = true;
      markTimmerAsCompleted();
    }, autoStartDelay);

    return () => {
      clearTimeout(timer);
      autostarted.current = false;
    };
  }, [store, autoStartDelay]);

  useEffect(() => {
    const unsubscribe = store.onPersistenceChange(({ touched }) => {
      if (touched.length === 0) {
        return;
      }

      dispatch(SKIP_PERSISTENCE);
    });

    return () => unsubscribe();
  }, [store]);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      dispatch();
    },
    [store.collection()]
  );

  const refresh = useCallback((dictionary: PrimitiveFilterDictionary) => {
    const newFields = store.rehydrate(dictionary);

    if (!newFields) {
      return;
    }

    dispatch(SKIP_PERSISTENCE);
  }, []);

  const dispatch = useCallback(
    function (persist: boolean = true) {
      store.whenReady("search-form", () => {
        const response = Promise.resolve(onSearch?.(store.collection()));

        setAutoLoadingStatus(true);

        response
          .then((result) => {
            if (result === false || !persist) {
              return;
            }

            store.persist();
          })
          .finally(() => setTimeout(() => setAutoLoadingStatus(false), 1000));
      });
    },
    [store]
  );

  const resolution = useCallback(
    ({ collection, touched, operation }: FieldStoreState) => {
      const isForcedOperation = forcedOperations.includes(operation);
      const isSetOperation = operation === "set";

      const isSubmittableField = isSetOperation && touched.some((name) => collection.get(name)?.submittable);

      const canBeSubmitted = submitOnChange || isForcedOperation || isSubmittableField;

      if (!canBeSubmitted) {
        return;
      }

      dispatch();
    },
    [submitOnChange]
  );

  const value = useMemo(
    () => ({
      store,
      isLoading,
      submitOnChange,
      isFormReady,
      refresh,
    }),
    [store, isLoading, submitOnChange, isFormReady, refresh]
  );

  return (
    <SearchBuilderContext.Provider value={value}>
      <SearchStateContextProvider store={store}>
        {isValidElement(Container) ? (
          cloneElement(Container, { onSubmit }, children)
        ) : (
          <form onSubmit={onSubmit} {...restOfProps}>
            {children}
          </form>
        )}
      </SearchStateContextProvider>
    </SearchBuilderContext.Provider>
  );
}

export default SearchForm;
