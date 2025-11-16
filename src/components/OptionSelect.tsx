import FilterFieldController, { type FieldController } from "@/components/FilterFieldController";
import { MenuItem, Select, type SelectProps } from "@mui/material";
import { type ReactElement, type ReactNode, useMemo } from "react";

import { type ArrayFilterFieldConfig, type EmptyArrayFilterFieldConfig, type ScalarFilterFieldConfig } from "@/hooks/useFilterField";

import { useSearchBuilder } from "@/context";
import type { ArrayItemType, FieldConfig, FilterLabel, FilterTypeKey, FilterTypeMap } from "@/field";

type NormalizedOptionItem<I extends string | number> = {
  value: I;
  label: ReactElement | string;
};

export type OptionSelectTypeKey = Extract<FilterTypeKey, "string" | "number" | "string[]" | "number[]">;
export type OptionSelectScalarTypeKey = Exclude<OptionSelectTypeKey, `${string}[]`>;
export type OptionSelectArrayTypeKey = Extract<OptionSelectTypeKey, `${string}[]`>;

export type UiArrayProps<TValue, TItem> = {
  items: TItem[];
  getValue: (item: TItem) => TValue;
  getLabel: (item: TItem) => ReactNode;
  children?: never;
};

export type UiObjectProps<TValue extends string | number, TItemsObj extends Record<TValue, ReactNode | string>> = {
  items: TItemsObj;
  getValue?: never;
  getLabel?: never;
  children?: never;
};

export type UiChildrenProps = {
  items?: never;
  getValue?: never;
  getLabel?: never;
  children: ReactNode;
};

export type UiVariantProps<TValue, TItem, TItemsObj> =
  | UiArrayProps<TValue, TItem>
  | UiObjectProps<TValue & (string | number), TItemsObj & Record<TValue & (string | number), ReactNode | string>>
  | UiChildrenProps;

type OmittedSelectProps = "value" | "name" | "defaultValue" | "multiple" | "type" | "multiple" | "onChange" | "items" | "children";

export type BaseOptionSelectProps = Omit<SelectProps, OmittedSelectProps>;

type OptionSelectConfig<
  TKey extends OptionSelectTypeKey,
  TValue extends FilterTypeMap[TKey],
  TItem,
  TOption extends string | number,
  TItemsObj
> = BaseOptionSelectProps &
  Omit<FieldConfig<TKey, TValue>, OmittedConfigProps> & {
    defaultValue?: TValue;
    toHumanLabel?: (value: TValue | TOption) => FilterLabel;
  } & UiVariantProps<TOption, TItem, TItemsObj>;

type OmittedConfigProps = "humanize" | "serializer";

export type ScalarOptionSelectConfig<
  TKey extends OptionSelectScalarTypeKey,
  TValue extends FilterTypeMap[TKey],
  TItem = unknown,
  TItemsObj = unknown
> = BaseOptionSelectProps &
  Omit<ScalarFilterFieldConfig<TKey, TValue>, OmittedConfigProps | "defaultValue"> & {
    defaultValue?: TValue;
    toHumanLabel?: (value: TValue) => FilterLabel;
  } & UiVariantProps<TValue, TItem, TItemsObj>;

export type ArrayOptionSelectConfig<
  TKey extends OptionSelectArrayTypeKey,
  TValue extends FilterTypeMap[TKey],
  TItem = unknown,
  TItemValue = ArrayItemType<TValue>,
  TItemsObj = unknown
> = BaseOptionSelectProps &
  Omit<ArrayFilterFieldConfig<TKey, TValue>, OmittedConfigProps | "defaultValue"> & {
    defaultValue?: TValue;
    toHumanLabel?: (value: TItemValue) => FilterLabel;
  } & UiVariantProps<TItemValue, TItem, TItemsObj>;

export type EmptyArrayOptionSelectConfig<
  TKey extends OptionSelectArrayTypeKey,
  TItem = unknown,
  TItemValue = ArrayItemType<FilterTypeMap[TKey]>,
  TItemsObj = unknown
> = BaseOptionSelectProps &
  Omit<EmptyArrayFilterFieldConfig<TKey>, OmittedConfigProps> & {
    toHumanLabel?: (value: TItemValue) => FilterLabel;
  } & UiVariantProps<TItemValue, TItem, TItemsObj>;

function isArrayBranch<TValue extends string | number, TItem, TItemsObj extends Record<TValue, ReactNode | string>>(
  props: UiVariantProps<TValue, TItem, TItemsObj>
): props is UiArrayProps<TValue, TItem> {
  return "items" in props && Array.isArray(props.items) && "getValue" in props;
}

function isObjectBranch<TValue extends string | number, TItem, TItemsObj extends Record<TValue, ReactNode | string>>(
  props: UiVariantProps<TValue, TItem, TItemsObj>
): props is UiObjectProps<TValue, TItemsObj> {
  return "items" in props && !!props.items && !Array.isArray(props.items) && typeof props.items === "object" && !("getValue" in props);
}

function normalize<TValue extends string | number, TItem, TItemsObj extends Record<TValue, ReactNode | string>>(
  props: UiVariantProps<TValue, TItem, TItemsObj>
): NormalizedOptionItem<TValue>[] | null {
  if (isArrayBranch(props)) {
    return props.items.map((item) => ({
      value: props.getValue(item),
      label: props.getLabel(item) as ReactElement | string,
    }));
  }

  if (isObjectBranch(props)) {
    return Object.entries(props.items).map(([value, label]) => ({
      value: value as TValue,
      label: label as ReactElement | string,
    }));
  }

  return null;
}

function validateOptionSelectProps<TValue extends string | number, TItem, TItemsObj extends Record<TValue, ReactNode | string>>(
  props: UiVariantProps<TValue, TItem, TItemsObj>
): void {
  if ("items" in props && props.items && "children" in props && props.children) {
    throw new Error(`
      [OptionSelect] Props conflict detected: Cannot use both "items" and "children" props simultaneously.

      ❌ PROBLEM: You've provided both "items" and "children" to OptionSelect, but these are mutually exclusive ways to define options.

      ✅ SOLUTION: Choose ONLY ONE of these three supported patterns:

      PATTERN 1: Array of objects with accessors
        <OptionSelect
          items={users}
          getValue={(user) => user.id}
          getLabel={(user) => user.name}
        />

      PATTERN 2: Simple key-value object
        <OptionSelect
          items={{
            "active": "Active",
            "inactive": "Inactive"
          }}
        />

      PATTERN 3: Direct MenuItem children
        <OptionSelect>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </OptionSelect>

      Remove either the "items" prop or the "children" to resolve this error.
    `);
  }
}

export function OptionSelect<TKey extends OptionSelectScalarTypeKey, TValue extends FilterTypeMap[TKey], TItem, TItemsObj>(
  props: ScalarOptionSelectConfig<TKey, TValue, TItem, TItemsObj>
): ReactElement;

export function OptionSelect<TKey extends OptionSelectArrayTypeKey, TItem, TItemsObj>(
  props: EmptyArrayOptionSelectConfig<TKey, TItem, TItemsObj>
): ReactElement;

export function OptionSelect<TKey extends OptionSelectArrayTypeKey, TValue extends FilterTypeMap[TKey], TItem, TItemsObj>(
  props: ArrayOptionSelectConfig<TKey, TValue, TItem, TItemsObj>
): ReactElement;

export function OptionSelect<
  Tkey extends OptionSelectTypeKey,
  TValue extends FilterTypeMap[Tkey],
  TItem,
  TItemValue extends string | number,
  TitemsObj extends Record<Extract<TItemValue, string | number>, ReactNode | string>
>(props: any) {
  validateOptionSelectProps(props);

  const { store } = useSearchBuilder();

  const { name, type, defaultValue, submittable, items, children, toHumanLabel, getValue, getLabel, ...restOfProps } =
    props as OptionSelectConfig<Tkey, TValue, TItem, TItemValue, TitemsObj>;

  const multiple = type.endsWith("[]");
  const emptyValue = multiple ? [] : "";

  const humanize = useMemo(() => {
    if (!toHumanLabel) {
      return undefined;
    }

    if (multiple) {
      return (value: string[] | string[]) =>
        value.map((v) => ({
          value: v,
          label: toHumanLabel(v as TValue | TItemValue) ?? String(v),
        }));
    }
    return toHumanLabel;
  }, [toHumanLabel, multiple]);

  const normalizedItems = useMemo(() => normalize(props), [items, getValue, getLabel, children]);

  const config = {
    type,
    name,
    defaultValue: defaultValue ?? emptyValue,
    submittable,
    humanize,
  } as Partial<FieldController<Tkey, TValue>>;

  return (
    <FilterFieldController
      store={store}
      {...(config as any)}
      control={({ value, onChange }) => {
        return (
          <Select {...restOfProps} multiple={multiple} value={value ?? emptyValue} onChange={onChange}>
            {children ??
              normalizedItems?.map(({ value, label }) => (
                <MenuItem key={`option-select-item-${value}`} value={value}>
                  {label}
                </MenuItem>
              ))}
          </Select>
        );
      }}
    />
  );
}

export default OptionSelect;
