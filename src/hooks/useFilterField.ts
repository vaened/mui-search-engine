import type { FieldStore } from "@/context/FieldStore";
import type { Field, FilterValue, InferHumanizeReturn, PrimitiveValue } from "@/types";
import { useEffect, useMemo } from "react";

export type UseSearchFieldProps<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>> = Omit<
  Field<V, P, H>,
  "value"
> & {
  defaultValue: V;
};

export function useFilterField<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>>(
  store: FieldStore,
  { name, defaultValue, submittable, ...restOfProps }: UseSearchFieldProps<V, P, H>
) {
  const field = useMemo(() => store.collection().get<V, P>(name), [store.collection(), name]);

  const value = field?.value;
  const isSubmitOnChangeEnabled = submittable === undefined ? false : submittable;

  useEffect(() => {
    store.register({
      name,
      value: defaultValue,
      submittable: isSubmitOnChangeEnabled,
      ...restOfProps,
    });

    return () => store.unregister(name);
  }, []);

  function set(value: V) {
    store.set(name, value);
  }

  return {
    set,
    field,
    value,
    isSubmitOnChangeEnabled,
  };
}
