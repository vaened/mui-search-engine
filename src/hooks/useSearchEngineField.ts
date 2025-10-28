/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngine } from "@/context";
import type { Field, FilterValue, InferHumanizeReturn, PrimitiveValue } from "@/types";
import { useEffect, useMemo } from "react";

export type UseSearchEngineFieldProps<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>> = Omit<
  Field<V, P, H>,
  "value"
> & {
  defaultValue: V;
};

export interface UseSearchEngineFieldResult<V extends FilterValue, P extends PrimitiveValue> {
  value?: V;
  field?: Field<V, P>;
  isSubmitOnChangeEnabled: boolean;
  set: (value: V) => void;
}

export function useSearchEngineField<V extends FilterValue, P extends PrimitiveValue, H extends InferHumanizeReturn<V>>({
  name,
  defaultValue,
  submittable,
  ...restOfProps
}: UseSearchEngineFieldProps<V, P, H>): UseSearchEngineFieldResult<V, P> {
  const { store, fields, submitOnChange } = useSearchEngine();

  const field = useMemo(() => fields.get<V, P>(name), [fields, name]);
  const value = useMemo(() => field?.value, [field?.value]);
  const isSubmitOnChangeEnabled = submittable === undefined ? submitOnChange : submittable;

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
