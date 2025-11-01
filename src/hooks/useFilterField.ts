import type { FieldStore } from "@/context/FieldStore";
import type { Field, FieldOptions, FilterValue, InferHumanizeReturn, PrimitiveValue } from "@/types";
import { useEffect, useSyncExternalStore } from "react";

export type UseSearchFieldProps<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>> = Omit<
  Field<V, P, H>,
  "value"
> & {
  defaultValue?: V;
};

export function useFilterField<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>>(
  store: FieldStore,
  { name, defaultValue, submittable, ...restOfProps }: UseSearchFieldProps<V, P, H>
) {
  const field = useSyncExternalStore(store.subscribe, store.listen<V, P>(name), store.listen<V, P>(name));

  useEffect(() => {
    store.register({
      name,
      value: (defaultValue ?? null) as V,
      submittable,
      ...restOfProps,
    });

    return () => store.unregister(name);
  }, []);

  useEffect(() => {
    const touched: Partial<FieldOptions> = {};

    if (submittable !== field?.submittable) {
      touched.submittable = submittable;
    }

    store.update(name, touched);
  }, [submittable]);

  function set(value: V) {
    store.set(name, value);
  }

  return {
    set,
    field,
    value: field?.value ?? defaultValue ?? null,
  };
}
