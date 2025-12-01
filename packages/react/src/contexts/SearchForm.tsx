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
import { CreateStoreOptions, FieldOperation, FieldsCollection, FieldStore } from "../store";

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

const submittableOperations: FieldOperation[] = ["sync", "reset", "set", "flush"];

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
  const [isFormReady, setReadyState] = useState(manualStart === true);
  const [isAutoLoading, setAutoLoadingStatus] = useState(false);
  const isLoading = isAutoLoading || loading;

  const store = useResolveFieldStoreInstance(source, configuration);

  const checkAutostartable = useCallback(() => !autostarted.current && !manualStart, [manualStart]);

  useEffect(() => {
    const unsubscribe = store.onFieldChange(({ collection: fields, operation: lastOperation, touched: touchedFieldNames }) => {
      onChange?.(fields);

      const isSubmittableOperation = submittableOperations.includes(lastOperation);
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
      setReadyState(true);
      return;
    }

    const timmer = setTimeout(() => {
      dispatch(store.collection());
      autostarted.current = true;
      setReadyState(true);
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
    function (values: FieldsCollection) {
      const response = Promise.resolve(onSearch?.(values));

      setAutoLoadingStatus(true);

      response
        .then((result) => {
          if (result === false) {
            return;
          }

          store.persist();
        })
        .finally(() => setAutoLoadingStatus(false));
    },
    [store]
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
