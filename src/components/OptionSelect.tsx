/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useFilterField } from "@/hooks/useFilterField";
import type { Field, FilterValue, PrimitiveValue } from "@/types";
import { Select, type SelectProps } from "@mui/material";
import type { SelectChangeEvent } from "node_modules/@mui/material";

export type OptionSelectProps<V extends FilterValue, P extends PrimitiveValue> = Omit<SelectProps<V>, "value" | "name"> &
  Omit<Field<V, P>, "value"> & {
    defaultValue: V;
  };

export function OptionSelect<V extends FilterValue, P extends PrimitiveValue>({
  name,
  defaultValue,
  children,
  multiple,
  submittable,
  humanize,
  serialize,
  unserialize,
  ...props
}: OptionSelectProps<V, P>) {
  const { value, set } = useFilterField({
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
