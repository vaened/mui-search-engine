/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { Field, FilterName, FilterValue, SerializedFilterDictionary, SerializedValue } from "@/types";

export interface RegisteredField<V extends FilterValue, S extends SerializedValue> extends Field<V, S> {
  readonly defaultValue: V;
}

export type RegisteredFieldDictionary<V extends FilterValue, S extends SerializedValue> = Record<FilterName, RegisteredField<V, S>>;

export interface FieldStoreState {
  readonly fields: RegisteredFieldDictionary<FilterValue, SerializedValue>;
}

export class FieldStore {
  #listeners: Set<() => void> = new Set();
  #persisted: SerializedFilterDictionary;
  #state: FieldStoreState = { fields: {} };

  constructor(values: SerializedFilterDictionary) {
    this.#persisted = values;
  }

  all = () => this.#state.fields;

  state = () => this.#state;

  exists = (name: FilterName) => !!this.#state.fields[name];

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  rehydrate = (newValues: SerializedFilterDictionary): RegisteredFieldDictionary<FilterValue, SerializedValue> | undefined => {
    this.#persisted = newValues;
    let changed = false;
    const currentFields = { ...this.#state.fields };
    const newFields = { ...currentFields };

    Object.keys(currentFields).forEach((name) => {
      const field = currentFields[name];
      let newValue: FilterValue = this.#parse(field);

      if (!Object.is(field.value, newValue)) {
        newFields[name] = { ...field, value: newValue };
        changed = true;
      }
    });

    if (!changed) {
      return;
    }

    this.#put({
      fields: newFields,
    });

    return newFields;
  };

  register = <V extends FilterValue, S extends SerializedValue>(field: Field<V, S>) => {
    if (this.exists(field.name)) {
      throw new Error(`Field "${field.name}" is already registered`);
    }

    const registered = {
      ...(field as unknown as Field<FilterValue, SerializedValue>),
      defaultValue: field.value,
    };

    this.#put({
      fields: {
        ...this.#state.fields,
        [field.name]: {
          ...registered,
          value: this.#parse(registered),
        },
      },
    });
  };

  unregister = (name: FilterName) => {
    if (!this.exists(name)) {
      return;
    }

    delete this.#state.fields[name];

    this.#put({
      fields: {
        ...this.#state.fields,
      },
    });
  };

  set = <V extends FilterValue>(name: FilterName, value: V) => {
    const field = this.#state.fields[name];

    if (!field || Object.is(field.value, value)) {
      return;
    }

    this.#put({
      fields: {
        ...this.#state.fields,
        [name]: {
          ...field,
          value,
        },
      },
    });
  };

  get = <V extends FilterValue, S extends SerializedValue>(name: FilterName): Field<V, S> | undefined => {
    return this.#state.fields[name] as unknown as Field<V, S> | undefined;
  };

  value = <V extends FilterValue>(name: FilterName): V | undefined => {
    return this.get<V, SerializedValue>(name)?.value as V | undefined;
  };

  #put = (state: Partial<FieldStoreState>) => {
    this.#state = {
      ...this.#state,
      ...state,
    };

    this.#notify();
  };

  #notify = () => {
    this.#listeners.forEach((listener) => listener());
  };

  #parse = <V extends FilterValue, S extends SerializedValue>(field: RegisteredField<V, S>): FilterValue => {
    const initial = this.#persisted[field.name];

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
