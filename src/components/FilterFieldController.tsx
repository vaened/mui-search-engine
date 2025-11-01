/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldStore } from "@/context/FieldStore";
import { useFilterField } from "@/hooks/useFilterField";
import type { Field, FilterValue, InferHumanizeReturn, InferSerializeReturn } from "@/types";
import { type ReactElement } from "react";

type Control<V extends FilterValue> = ({ value, set }: { value: V | null; set: (value: V) => void }) => ReactElement;

export type FilterFieldControllerProps<V extends FilterValue, P extends InferSerializeReturn<V>, H extends InferHumanizeReturn<V>> = Omit<
  Field<V, P, H>,
  "value"
> & {
  store: FieldStore;
  defaultValue?: V;
  control: Control<V>;
};

export function FilterFieldController<
  V extends FilterValue,
  P extends InferSerializeReturn<V>,
  H extends InferHumanizeReturn<V> = InferHumanizeReturn<V>
>({ store, control, ...restOfProps }: FilterFieldControllerProps<V, P, H>) {
  const { value, set } = useFilterField(store, restOfProps);

  return control({ value, set });
}

export default FilterFieldController;
