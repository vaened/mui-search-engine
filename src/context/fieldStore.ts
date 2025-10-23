/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { Field, FilterName, FilterValue, SerializedFilterDictionary, SerializedValue } from "@/types";

export interface RegisteredField<V extends FilterValue, S extends SerializedValue> extends Field<V, S> {
  readonly defaultValue: V;
}

export class FieldStore {
  #listeners: Set<() => void> = new Set();
  #initial: SerializedFilterDictionary;
  fields: Record<FilterName, RegisteredField<FilterValue, SerializedValue>> = {};

  constructor(values: SerializedFilterDictionary) {
    this.#initial = values;
  }

  all = () => this.fields;

  exists = (name: FilterName) => !!this.fields[name];

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  register = <V extends FilterValue, S extends SerializedValue>(field: Field<V, S>) => {
    if (this.exists(field.name)) {
      throw new Error(`Field "${field.name}" is already registered`);
    }

    const registered = {
      ...(field as unknown as Field<FilterValue, SerializedValue>),
      defaultValue: field.value,
    };

    this.fields = {
      ...this.fields,
      [field.name]: {
        ...registered,
        value: this.#parse(registered),
      },
    };

    this.#notify();
  };

  unregister = (name: FilterName) => {
    if (!this.exists(name)) {
      return;
    }

    delete this.fields[name];

    this.fields = { ...this.fields };
    this.#notify();
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
    this.#notify();
  };

  get = <V extends FilterValue, S extends SerializedValue>(name: FilterName): Field<V, S> | undefined => {
    return this.fields[name] as unknown as Field<V, S> | undefined;
  };

  value = <V extends FilterValue>(name: FilterName): V | undefined => {
    return this.get<V, SerializedValue>(name)?.value as V | undefined;
  };

  #notify = () => {
    this.#listeners.forEach((listener) => listener());
  };

  #parse = <V extends FilterValue, S extends SerializedValue>(field: RegisteredField<V, S>): FilterValue => {
    const initial = this.#initial[field.name];

    if (!this.#isValid(initial)) {
      return field.defaultValue;
    }

    return field.unserialize ? field.unserialize(initial as S) : initial;
  };

  #isValid = (value: unknown) => {
    return value !== undefined && value !== null;
  };
}

export function createFieldsStore(values: SerializedFilterDictionary): FieldStore {
  return new FieldStore(values);
}
