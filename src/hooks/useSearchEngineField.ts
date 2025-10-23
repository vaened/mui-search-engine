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
  set: (value: V) => void;
}

export function useSearchEngineField<V extends FilterValue, S extends SerializedValue>({
  name,
  humanize,
  defaultValue,
  serialize,
  unserialize,
}: UseSearchEngineFieldProps<V, S>): UseSearchEngineFieldResult<V, S> {
  const { store, fields } = useSearchEngine();

  const field = useMemo(() => fields[name] as unknown as Field<V, S> | undefined, [fields, name]);
  const value = useMemo(() => field?.value, [field?.value]);

  useEffect(() => {
    store.register({
      name,
      value: defaultValue,
      humanize,
      serialize,
      unserialize,
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
  };
}
