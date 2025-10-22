/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FilterName, FilterValue, RegisteredField, SerializedFilterDictionary, SerializedValue } from "@/types";

export class FieldStore {
  private listeners: Set<() => void> = new Set();
  #initial: SerializedFilterDictionary;
  fields: Record<FilterName, RegisteredField<FilterValue, SerializedValue>> = {};

  constructor(values: SerializedFilterDictionary) {
    this.#initial = values;
  }

  private notify = () => {
    this.listeners.forEach((listener) => listener());
  };

  all = () => this.fields;

  exists = (name: FilterName) => !!this.fields[name];

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  register = <V extends FilterValue, S extends SerializedValue>(field: RegisteredField<V, S>) => {
    if (this.exists(field.name)) {
      throw new Error(`Field "${field.name}" is already registered`);
    }

    const initial = this.#initial[field.name];
    const value = initial && field.unserialize ? field.unserialize(initial as S) : field.value;

    this.fields = {
      ...this.fields,
      [field.name]: {
        ...(field as unknown as RegisteredField<FilterValue, SerializedValue>),
        value,
      },
    };

    this.notify();
  };

  unregister = (name: FilterName) => {
    if (!this.exists(name)) {
      return;
    }

    delete this.fields[name];

    this.fields = { ...this.fields };
    this.notify();
  };

  set = <V extends FilterValue>(name: FilterName, value: V) => {
    const field = this.fields[name];

    if (!field || Object.is(field.value, value)) {
      return;
    }

    this.fields = {
      ...this.fields,
      [name]: {
        ...field,
        value,
      },
    };
    this.notify();
  };

  get = <V extends FilterValue, S extends SerializedValue>(name: FilterName): RegisteredField<V, S> | undefined => {
    return this.fields[name] as unknown as RegisteredField<V, S> | undefined;
  };

  value = <V extends FilterValue>(name: FilterName): V | undefined => {
    return this.get<V, SerializedValue>(name)?.value as V | undefined;
  };
}

export function createFieldsStore(values: SerializedFilterDictionary): FieldStore {
  return new FieldStore(values);
}
