/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FilterFieldController from "@/components/FilterFieldController";
import { useSearchBuilder } from "@/context";
import type { UnpackedValue } from "@/internal";
import type { FilterName, InferHumanizeReturn, InferSerializeReturn } from "@/types";
import { MenuItem, Select, type SelectProps } from "@mui/material";
import { useCallback, useMemo, type ReactElement, type ReactNode } from "react";

type SingularValue = string | number;

type OptionValue = SingularValue | SingularValue[];

type NormalizedOptionItem<V extends OptionValue, I extends UnpackedValue<V>> = {
  value: I;
  label: ReactElement | string;
};

export type ArrayOptionItemProps<V extends OptionValue, I extends UnpackedValue<V>, O> = {
  items: O[];
  getValue: (item: O) => I;
  getLabel: (item: O) => ReactElement | string;
};

export type ObjectOptionItemProps<V extends OptionValue, I extends UnpackedValue<V>> = {
  items?: Record<I, ReactElement | string>;
};

export type OptionSelectProps<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>> = Omit<
  SelectProps<V>,
  "value" | "name"
> & {
  name: FilterName;
  submittable: boolean;
  untrackable?: boolean;
  defaultValue?: V;
  unserialize?: (value: P) => V;
  serialize?: (value: V) => P;
  toHumanLabel?: (value: I) => string;
} & (ArrayOptionItemProps<V, I, O> | ObjectOptionItemProps<V, I> | { items: never; children: ReactNode });

export function OptionSelect<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>>(
  props: OptionSelectProps<V, I, O, P>
) {
  validateOptionSelectProps(props);

  const { store } = useSearchBuilder();
  const {
    name,
    defaultValue,
    multiple,
    submittable,
    untrackable,
    children,
    toHumanLabel,
    serialize: serializer,
    unserialize: unserializer,
    ...restOfProps
  } = props;
  const items = useMemo(() => normalize(props), [props.items]);

  const serialize = useCallback((value: V) => {
    return serializer?.(value) ?? (value as InferSerializeReturn<V>);
  }, []);

  const unserialize = useCallback((value: InferSerializeReturn<V>) => {
    return unserializer?.(value as P) ?? (value as V);
  }, []);

  function humanize(value: V): InferHumanizeReturn<V> {
    if (toHumanLabel === undefined) {
      return undefined;
    }

    if (isSingularValue(value)) {
      return (toHumanLabel(value as I) ?? String(value)) as InferHumanizeReturn<V>;
    }

    return value.map((singular) => ({
      label: toHumanLabel(singular as I) ?? String(singular),
      value: singular,
    })) as InferHumanizeReturn<V>;
  }

  return (
    <FilterFieldController
      store={store}
      name={name}
      defaultValue={(defaultValue ? defaultValue : multiple ? [] : "") as V}
      humanize={untrackable ? undefined : humanize}
      serialize={serialize}
      unserialize={unserialize}
      submittable={submittable}
      control={({ value, onChange }) => {
        return (
          <Select {...restOfProps} multiple={multiple} value={value as V} onChange={onChange}>
            {children
              ? children
              : items?.map(({ value, label }, index) => (
                  <MenuItem key={String(value)} value={value}>
                    {label}
                  </MenuItem>
                ))}
          </Select>
        );
      }}
    />
  );
}

function isSingularValue(value: OptionValue): value is SingularValue {
  return !Array.isArray(value);
}

function isArrayOptionItemProps<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>>(
  x: OptionSelectProps<V, I, O, P>
): x is OptionSelectProps<V, I, O, P> & ArrayOptionItemProps<V, I, O> {
  return "items" in x && Array.isArray(x.items);
}
function isObjectOptionItemProps<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>>(
  x: OptionSelectProps<V, I, O, P>
): x is OptionSelectProps<V, I, O, P> & ObjectOptionItemProps<V, I> {
  return "items" in x && x.items !== null && typeof x.items === "object";
}

function normalize<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>>(
  props: OptionSelectProps<V, I, O, P>
): NormalizedOptionItem<V, I>[] | null {
  if (isArrayOptionItemProps(props)) {
    return props.items.map((item) => ({
      value: props.getValue(item) as I,
      label: props.getLabel(item),
    }));
  }

  if (isObjectOptionItemProps(props)) {
    return Object.entries<ReactElement | string>(props.items || {}).map(([value, label]) => ({ value: value as I, label }));
  }

  return null;
}

function validateOptionSelectProps<V extends OptionValue, I extends UnpackedValue<V>, O, P extends InferSerializeReturn<V>>(
  props: OptionSelectProps<V, I, O, P>
): void {
  if ("items" in props && props.items && "children" in props && props.children) {
    throw new Error(`
      [OptionSelect] Cannot use both "items" and "children" props simultaneously.
      
      Use ONLY ONE of these options:
      
      ✅ With items (auto-generation):
      <OptionSelect
        items={[...]}
        getValue={...}
        getLabel={...}
      />
      
      ✅ With children (custom):
      <OptionSelect>
        <MenuItem>...</MenuItem>
      </OptionSelect>
    `);
  }
}

export default OptionSelect;
