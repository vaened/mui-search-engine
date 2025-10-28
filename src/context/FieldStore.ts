/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { RegisteredField, RegisteredFieldDictionary } from "@/context";
import { FieldsCollection } from "@/context/FieldsCollection";
import type { Field, FilterName, FilterValue, PrimitiveFilterDictionary, PrimitiveValue } from "@/types";

export type FieldOperation = "set" | "unregister" | "register" | "rehydrate" | "reset" | null;

export type FieldStoreState = Readonly<{
  collection: FieldsCollection;
  operation: FieldOperation;
  touched: FilterName[];
}>;

export class FieldStore {
  readonly #initial: PrimitiveFilterDictionary;
  #listeners: Set<() => void> = new Set();
  #fields: RegisteredFieldDictionary;
  #state: FieldStoreState = { collection: FieldsCollection.empty(), touched: [], operation: null };

  constructor(initial: PrimitiveFilterDictionary) {
    this.#initial = initial;
    this.#fields = new Map();
  }

  state = () => this.#state;

  exists = (name: FilterName) => this.#fields.has(name);

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  rehydrate = (newValues: PrimitiveFilterDictionary): FieldsCollection | undefined => {
    const touched: FilterName[] = [];

    this.#fields.forEach((field) => {
      const newValue = this.#parse(newValues[field.name], field);

      if (!Object.is(field.value, newValue)) {
        this.#override(field, newValue);
        touched.push(field.name);
      }
    });

    if (touched.length === 0) {
      return;
    }

    const collection = new FieldsCollection(this.#fields);

    this.#commit({ operation: "rehydrate", collection, touched });

    return collection;
  };

  register = <V extends FilterValue, P extends PrimitiveValue>(field: Field<V, P>) => {
    if (this.exists(field.name)) {
      throw new Error(`Field "${field.name}" is already registered`);
    }

    const registered = {
      ...(field as unknown as Field<FilterValue, PrimitiveValue>),
      defaultValue: field.value,
      updatedAt: Date.now(),
    };

    this.#override(registered, this.#parse(this.#initial[field.name], registered));

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

    this.#override(field, value);

    this.#commit({
      operation: "set",
      touched: [name],
      collection: new FieldsCollection(this.#fields),
    });
  };

  reset = () => {
    const touched: FilterName[] = [];

    this.#fields.forEach((field) => {
      if (!Object.is(field.value, field.defaultValue)) {
        this.#override(field, field.defaultValue);
        touched.push(field.name);
      }
    });

    if (touched.length === 0) {
      return;
    }

    const collection = new FieldsCollection(this.#fields);

    this.#commit({ operation: "reset", collection, touched });
  };

  #commit = (state: Partial<FieldStoreState>) => {
    this.#state = {
      ...this.#state,
      ...state,
    };

    this.#listeners.forEach((listener) => listener());
  };

  #parse = (newValue: PrimitiveValue | undefined, field: RegisteredField): FilterValue => {
    if (!FieldsCollection.isValidValue(newValue)) {
      return field.defaultValue;
    }

    return field.unserialize ? field.unserialize(newValue) : newValue;
  };

  #override = (field: RegisteredField<FilterValue, PrimitiveValue>, newValue: FilterValue) => {
    this.#fields.set(field.name, { ...field, updatedAt: Date.now(), value: newValue });
  };
}

export function createFieldsStore(values: PrimitiveFilterDictionary): FieldStore {
  return new FieldStore(values);
}
