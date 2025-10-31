/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { Events, RegisteredField, RegisteredFieldDictionary } from "@/context";
import { FieldsCollection } from "@/context/FieldsCollection";
import { createEventEmitter, type EventEmitter, type Unsubscribe } from "@/context/event-emitter";
import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import type { Field, FilterName, FilterValue, PrimitiveFilterDictionary, PrimitiveValue } from "@/types";

export type FieldOperation = "set" | "unregister" | "register" | "rehydrate" | "sync" | "reset" | null;

export type FieldStoreState = Readonly<{
  collection: FieldsCollection;
  operation: FieldOperation;
  touched: FilterName[];
}>;

export class FieldStore {
  readonly #persistence: PersistenceAdapter;
  readonly #emitter: EventEmitter<Events>;

  #initial: PrimitiveFilterDictionary;
  #listeners: Set<() => void> = new Set();
  #fields: RegisteredFieldDictionary;
  #state: FieldStoreState = { collection: FieldsCollection.empty(), touched: [], operation: null };

  constructor(persistence: PersistenceAdapter, emitter: EventEmitter<Events> | null = null) {
    this.#fields = new Map();
    this.#persistence = persistence;
    this.#emitter = emitter ?? createEventEmitter<Events>();
    this.#initial = persistence.read() ?? {};
  }

  state = () => this.#state;

  exists = (name: FilterName) => this.#fields.has(name);

  collection = () => this.#state.collection;

  subscribe = (listener: () => void): Unsubscribe => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  sync = (): FieldsCollection | undefined => {
    const newValues = this.#persistence.read();
    const touched = this.#fillFieldsFrom(newValues);

    if (!touched) {
      return;
    }

    const collection = new FieldsCollection(this.#fields);

    this.#commit({ operation: "sync", collection, touched });

    return collection;
  };

  persist = () => {
    const collection = this.#state.collection;
    this.#persistence.write(collection.toPrimitives());
    this.#emitter.emit("submit", collection);
  };

  rehydrate = (newValues: PrimitiveFilterDictionary): FieldsCollection | undefined => {
    const touched = this.#fillFieldsFrom(newValues);

    if (!touched) {
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

  onPersistenceChange = (listener: (fields: FieldsCollection | undefined) => void): Unsubscribe => {
    return this.#persistence.subscribe(() => listener(this.sync()));
  };

  onFieldSubmit = (listener: (fields: FieldsCollection) => void): Unsubscribe => {
    return this.#emitter.on("submit", listener);
  };

  onFieldChange = (listener: (fields: FieldsCollection, operation: FieldOperation) => void): Unsubscribe => {
    return this.#emitter.on("change", ({ fields, operation }) => listener(fields, operation));
  };

  #fillFieldsFrom = (newValues: PrimitiveFilterDictionary): FilterName[] | undefined => {
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

    return touched;
  };

  #commit = (state: Partial<FieldStoreState>) => {
    this.#state = {
      ...this.#state,
      ...state,
    };

    this.#listeners.forEach((listener) => listener());

    if (state.hasOwnProperty("collection")) {
      this.#emitter.emit("change", { fields: this.#state.collection, operation: this.#state.operation });
    }
  };

  #parse = (
    newValue: PrimitiveValue | undefined,
    field: Pick<RegisteredField<FilterValue, PrimitiveValue>, "unserialize" | "defaultValue">
  ): FilterValue => {
    if (!FieldsCollection.isValidValue(newValue)) {
      return field.defaultValue;
    }

    return field.unserialize ? field.unserialize(newValue) : newValue;
  };

  #override = (field: Omit<RegisteredField<FilterValue, PrimitiveValue>, "updatedAt" | "value">, newValue: FilterValue) => {
    this.#fields.set(field.name, { ...field, updatedAt: Date.now(), value: newValue });
  };
}
