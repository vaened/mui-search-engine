/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngineField } from "@/hooks/useSearchEngineField";
import type { Field, FilterValue, SerializedValue } from "@/types";
import { Select, type SelectProps } from "@mui/material";
import type { SelectChangeEvent } from "node_modules/@mui/material";

export type OptionSelectProps<V extends FilterValue, S extends SerializedValue> = Omit<SelectProps<V>, "value" | "name"> &
  Omit<Field<V, S>, "value"> & {
    defaultValue: V;
  };

export function OptionSelect<V extends FilterValue, S extends SerializedValue>({
  name,
  defaultValue,
  children,
  multiple,
  submittable,
  humanize,
  serialize,
  unserialize,
  ...props
}: OptionSelectProps<V, S>) {
  const { value, set } = useSearchEngineField({
    name,
    defaultValue,
    submittable,
    humanize,
    serialize,
    unserialize,
  });

  function onOptionChange(event: SelectChangeEvent<V>) {
    set(event.target.value as V);
  }

  return (
    <Select
      {...props}
      onChange={onOptionChange}
      multiple={multiple}
      value={(value ? value : multiple ? [] : "") as V}
      children={children}
    />
  );
}

export default OptionSelect;
