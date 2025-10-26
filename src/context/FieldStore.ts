/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { RegisteredField, RegisteredFieldDictionary } from "@/context";
import { FieldsCollection } from "@/context/FieldsCollection";
import type { Field, FilterName, FilterValue, SerializedFilterDictionary, SerializedValue } from "@/types";

export type FieldStoreState = Readonly<{
  collection: FieldsCollection;
  operation: "set" | "unregister" | "register" | "rehydrate" | null;
  touched: FilterName[];
}>;

export class FieldStore {
  #listeners: Set<() => void> = new Set();
  #persisted: SerializedFilterDictionary;
  #fields: RegisteredFieldDictionary;
  #state: FieldStoreState = { collection: FieldsCollection.empty(), touched: [], operation: null };

  constructor(values: SerializedFilterDictionary) {
    this.#persisted = values;
    this.#fields = new Map();
  }

  state = () => this.#state;

  exists = (name: FilterName) => this.#fields.has(name);

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  rehydrate = (newValues: SerializedFilterDictionary): FieldsCollection | undefined => {
    this.#persisted = newValues;
    const touched: FilterName[] = [];
    let changed = false;

    this.#fields.forEach((field) => {
      const newValue = this.#parse(field);

      if (!Object.is(field.value, newValue)) {
        this.#fields.set(field.name, { ...field, value: newValue });
        touched.push(field.name);
        changed = true;
      }
    });

    if (!changed) {
      return;
    }

    const collection = new FieldsCollection(this.#fields);

    this.#commit({ operation: "rehydrate", collection, touched });

    return collection;
  };

  register = <V extends FilterValue, S extends SerializedValue>(field: Field<V, S>) => {
    if (this.exists(field.name)) {
      throw new Error(`Field "${field.name}" is already registered`);
    }

    const registered = {
      ...(field as unknown as Field<FilterValue, SerializedValue>),
      defaultValue: field.value,
    };

    this.#fields.set(field.name, {
      ...registered,
      value: this.#parse(registered),
    });

    this.#commit({
      operation: "register",
      collection: new FieldsCollection(this.#fields),
    });
  };

  unregister = (name: FilterName) => {
    if (!this.exists(name)) {
      return;
    }

    this.#fields.delete(name);

    this.#commit({
      operation: "unregister",
      collection: new FieldsCollection(this.#fields),
    });
  };

  set = <V extends FilterValue>(name: FilterName, value: V) => {
    const field = this.#fields.get(name);

    if (!field || Object.is(field.value, value)) {
      return;
    }

    this.#fields.set(name, { ...field, value });

    this.#commit({
      operation: "set",
      touched: [name],
      collection: new FieldsCollection(this.#fields),
    });
  };

  #commit = (state: Partial<FieldStoreState>) => {
    this.#state = {
      ...this.#state,
      ...state,
    };

    this.#listeners.forEach((listener) => listener());
  };

  #parse = <V extends FilterValue, S extends SerializedValue>(field: RegisteredField<V, S>): FilterValue => {
    const initial = this.#persisted[field.name];

    if (!FieldsCollection.isValidValue(initial)) {
      return field.defaultValue;
    }

    return field.unserialize ? field.unserialize(initial as S) : initial;
  };
}

export function createFieldsStore(values: SerializedFilterDictionary): FieldStore {
  return new FieldStore(values);
}
