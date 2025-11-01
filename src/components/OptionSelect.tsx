/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FilterFieldController from "@/components/FilterFieldController";
import { useSearchBuilder } from "@/context";
import type { Field, FilterValue, InferSerializeReturn, PrimitiveValue } from "@/types";
import { Select, type SelectProps } from "@mui/material";

export type OptionSelectProps<V extends FilterValue, P extends PrimitiveValue> = Omit<SelectProps<V>, "value" | "name"> &
  Omit<Field<V, P>, "value"> & {
    defaultValue: V;
  };

export function OptionSelect<V extends FilterValue, P extends PrimitiveValue>({
  name,
  defaultValue,
  multiple,
  submittable,
  humanize,
  serialize,
  unserialize,
  ...props
}: OptionSelectProps<V, P>) {
  const { store } = useSearchBuilder();

  return (
    <FilterFieldController
      store={store}
      name={name}
      defaultValue={defaultValue}
      humanize={humanize}
      serialize={serialize as (value: V) => InferSerializeReturn<V>}
      unserialize={unserialize as (value: InferSerializeReturn<V>) => V}
      submittable={submittable}
      control={({ value, onChange }) => (
        <Select {...props} multiple={multiple} value={(value ? value : multiple ? [] : "") as V} onChange={onChange} />
      )}
    />
  );
}

export default OptionSelect;
