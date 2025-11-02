/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FilterFieldController from "@/components/FilterFieldController";
import { useSearchBuilder } from "@/context";
import type { UnpackedValue } from "@/internal";
import type { FilterName, InferHumanizeReturn, InferSerializeReturn } from "@/types";
import { Select, type SelectProps } from "@mui/material";
import { useCallback } from "react";

type SingularValue = string | number | boolean;

type OptionValue = SingularValue | SingularValue[];

export type OptionSelectProps<V extends OptionValue, H extends UnpackedValue<V>> = Omit<SelectProps<V>, "value" | "name"> & {
  name: FilterName;
  submittable: boolean;
  untrackable?: boolean;
  defaultValue?: V;
  toHumanLabel?: (value: H) => string;
};

function isSingularValue(value: OptionValue): value is SingularValue {
  return !Array.isArray(value);
}
export function OptionSelect<V extends OptionValue, H extends UnpackedValue<V>>({
  name,
  defaultValue,
  multiple,
  submittable,
  untrackable,
  toHumanLabel,
  ...restOfProps
}: OptionSelectProps<V, H>) {
  const { store } = useSearchBuilder();

  const serialize = useCallback((value: V) => value as InferSerializeReturn<V>, []);

  const unserialize = useCallback((value: InferSerializeReturn<V>) => value as V, []);

  function humanize(value: V): InferHumanizeReturn<V> {
    if (isSingularValue(value)) {
      return (toHumanLabel?.(value as H) ?? String(value)) as InferHumanizeReturn<V>;
    }

    return value.map((singular) => ({
      label: toHumanLabel?.(singular as H) ?? String(singular),
      value: singular,
    })) as InferHumanizeReturn<V>;
  }

  return (
    <FilterFieldController
      {...restOfProps}
      store={store}
      name={name}
      defaultValue={(defaultValue ? defaultValue : multiple ? [] : "") as V}
      humanize={untrackable ? undefined : humanize}
      serialize={serialize}
      unserialize={unserialize}
      submittable={submittable}
      control={({ value, onChange }) => {
        return <Select {...restOfProps} multiple={multiple} value={value as V} onChange={onChange} />;
      }}
    />
  );
}

export default OptionSelect;
