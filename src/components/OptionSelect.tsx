/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngineField } from "@/hooks/useSearchEngineField";
import type { Field, FilterName, FilterValue, SerializedValue } from "@/types";
import { Select, type SelectProps } from "@mui/material";
import type { SelectChangeEvent } from "node_modules/@mui/material";

export type OptionSelectProps<V extends FilterValue, S extends SerializedValue> = Omit<SelectProps<V>, "value" | "name"> & {
  name: FilterName;
  defaultValue: V;
  humanize?: Field<V, S>["humanize"];
  serialize?: Field<V, S>["serialize"];
  unserialize?: Field<V, S>["unserialize"];
};

export function OptionSelect<V extends FilterValue, S extends SerializedValue>({
  name,
  defaultValue,
  children,
  multiple,
  humanize,
  serialize,
  unserialize,
  ...props
}: OptionSelectProps<V, S>) {
  const { value, set } = useSearchEngineField({
    name,
    defaultValue,
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
