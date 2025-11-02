/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldStore } from "@/context/FieldStore";
import { useFilterField } from "@/hooks/useFilterField";
import type { Field, FilterValue, InferHumanizeReturn, InferSerializeReturn } from "@/types";
import { type ReactElement } from "react";

type Event = { target: any } | any;

type Control<V extends FilterValue> = ({ value, onChange }: { value: V | null; onChange: (event: Event) => void }) => ReactElement;

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

  function onChange(event: Event) {
    const value = getEventValue(event);
    set(value);
  }

  return control({ value, onChange });
}

function isObject<T extends object>(value: unknown): value is T {
  return value !== null && !Array.isArray(value) && typeof value === "object" && !(value instanceof Date);
}

function isCheckbox(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | { type?: string }): element is HTMLInputElement {
  return element.type === "checkbox";
}

function getEventValue(event: Event) {
  const target = event.target;

  if (isObject(target) && target) {
    return isCheckbox(target) ? target.checked : (target as any).value;
  }

  return event;
}

export default FilterFieldController;
