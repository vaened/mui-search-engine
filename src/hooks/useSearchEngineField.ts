/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngine } from "@/context";
import type { Field, FilterValue, SerializedValue } from "@/types";
import { useEffect, useMemo } from "react";

export type UseSearchEngineFieldProps<V extends FilterValue, S extends SerializedValue> = Omit<Field<V, S>, "value"> & {
  defaultValue: V;
};

export interface UseSearchEngineFieldResult<V extends FilterValue, S extends SerializedValue> {
  value?: V;
  field?: Field<V, S>;
  isSubmitOnChangeEnabled: boolean;
  set: (value: V) => void;
}

export function useSearchEngineField<V extends FilterValue, S extends SerializedValue>({
  name,
  defaultValue,
  submittable,
  ...restOfProps
}: UseSearchEngineFieldProps<V, S>): UseSearchEngineFieldResult<V, S> {
  const { store, fields, submitOnChange } = useSearchEngine();

  const field = useMemo(() => fields[name] as unknown as Field<V, S> | undefined, [fields, name]);
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
