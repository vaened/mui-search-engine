/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { GenericRegisteredField, RegisteredField, RegisteredFieldDictionary } from "@/context";
import { FieldsCollection } from "@/context/FieldsCollection";
import { createEventEmitter, type EventEmitter, type Unsubscribe } from "@/context/event-emitter";
import type {
  FieldOptions,
  FilterName,
  FilterTypeKey,
  FilterTypeMap,
  GenericField,
  PrimitiveFilterDictionary,
  PrimitiveValue,
  ValueOf,
} from "@/field";
import { url } from "@/persistence";
import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";

export type FieldOperation = "set" | "update" | "unregister" | "register" | "rehydrate" | "sync" | "reset" | null;

export type FieldStoreOptions = {
  persistence?: PersistenceAdapter;
  emitter?: EventEmitter;
};

export type FieldStoreState = Readonly<{
  collection: FieldsCollection;
  operation: FieldOperation;
  touched: FilterName[];
}>;

export class FieldStore {
  readonly #persistence: PersistenceAdapter;
  readonly #emitter: EventEmitter;

  #whitelist: FilterName[];
  #initial: PrimitiveFilterDictionary;
  #listeners: Set<() => void> = new Set();
  #fields: RegisteredFieldDictionary;
  #state: FieldStoreState;

  constructor(persistence: PersistenceAdapter, emitter: EventEmitter) {
    this.#fields = new Map();
    this.#persistence = persistence;
    this.#emitter = emitter;
    this.#initial = persistence.read() ?? {};
    this.#state = this.#initialState();
    this.#whitelist = [];
  }

  state = () => this.#state;

  exists = (name: FilterName) => this.#fields.has(name);

  collection = () => this.#state.collection;

  subscribe = (listener: () => void): Unsubscribe => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  listen = <TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]>(
    name: FilterName
  ): (() => RegisteredField<TKey, TValue> | undefined) => {
    return () => this.#state.collection.get(name) as RegisteredField<TKey, TValue> | undefined;
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
    this.#persistence.write(collection.toPrimitives(), this.#whitelist);
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

  register<F extends GenericField>(field: F): void {
    if (this.exists(field.name)) {
      throwAlreadyRegisteredErrorFor(field, this.#fields);
    }

    const registered = {
      ...field,
      defaultValue: field.value,
      updatedAt: Date.now(),
    } as unknown as GenericRegisteredField;

    this.#whitelist.push(field.name);
    this.#override(registered, this.#parse(this.#initial[field.name], registered));
    this.#commit({ operation: "register", collection: new FieldsCollection(this.#fields) });
  }

  unregister = (name: FilterName) => {
    if (!this.exists(name)) {
      return;
    }

    this.#fields.delete(name);
    this.#whitelist = this.#whitelist.filter((field) => field !== name);

    this.#commit({
      operation: "unregister",
      collection: new FieldsCollection(this.#fields),
    });
  };

  update = (name: FilterName, meta: Partial<FieldOptions>) => {
    if (Object.keys(meta).length === 0) {
      return;
    }

    const field = this.#fields.get(name);

    if (!field) {
      throw new Error(`Field "${name}" does not exist`);
    }

    this.#fields.set(name, { ...field, ...meta });

    this.#commit({
      operation: "update",
      touched: [name],
      collection: new FieldsCollection(this.#fields),
    });
  };

  get = <TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]>(name: FilterName): RegisteredField<TKey, TValue> | undefined => {
    return this.#state.collection.get(name) as RegisteredField<TKey, TValue> | undefined;
  };

  set = (name: FilterName, value: GenericRegisteredField["value"] | null) => {
    const field = this.#fields.get(name);

    if (!field || Object.is(field.value, value)) {
      return;
    }

    this.#override(field, value as ValueOf<typeof field>);

    this.#commit({ operation: "set", touched: [name], collection: new FieldsCollection(this.#fields) });
  };

  reset = () => {
    const touched: FilterName[] = [];

    this.#fields.forEach((field) => {
      if (Object.is(field.value, field.defaultValue)) {
        console.log({ name: field.name, value: field.value, defaultValue: field.defaultValue });
      }

      if (!Object.is(field.value, field.defaultValue)) {
        this.#override(field, field.defaultValue as ValueOf<typeof field>);
        touched.push(field.name);
      }
    });

    if (touched.length === 0) {
      return;
    }

    this.#commit({ operation: "reset", collection: new FieldsCollection(this.#fields), touched });
  };

  clean = () => {
    this.#commit(this.#initialState());
  };

  onPersistenceChange = (listener: (fields: FieldsCollection | undefined) => void): Unsubscribe => {
    return this.#persistence.subscribe(() => listener(this.sync()));
  };

  onFieldSubmit = (listener: (fields: FieldsCollection) => void): Unsubscribe => {
    return this.#emitter.on("submit", listener);
  };

  onFieldChange = (listener: (state: FieldStoreState) => void): Unsubscribe => {
    return this.#emitter.on("change", (state) => listener(state));
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

    return touched.length ? touched : undefined;
  };

  #commit = (state: Partial<FieldStoreState>) => {
    this.#state = {
      ...this.#state,
      ...state,
    };

    this.#listeners.forEach((listener) => listener());
    this.#emitter.emit("change", this.#state);
  };

  #parse = <T extends GenericRegisteredField>(newValue: PrimitiveValue, field: Pick<T, "defaultValue" | "serializer">): ValueOf<T> => {
    if (newValue === undefined || newValue === null) {
      return field.defaultValue as ValueOf<T>;
    }

    return field.serializer.unserialize(newValue as any) as ValueOf<T>;
  };

  #override<F extends GenericRegisteredField>(field: F, newValue: ValueOf<F>): void {
    this.#fields.set(field.name, {
      ...(field as F),
      updatedAt: Date.now(),
      value: newValue,
    });
  }

  #initialState = (): FieldStoreState => ({
    collection: FieldsCollection.empty(),
    touched: [],
    operation: null,
  });
}

function throwAlreadyRegisteredErrorFor(field: GenericField, fields: Map<string, GenericRegisteredField>) {
  throw new Error(`
DUPLICATE FIELD REGISTRATION
=================================

Field "${field.name}" is already registered and cannot be registered again.

QUICK FIX:
Check for multiple components using the same field name "${field.name}" in your application.

TECHNICAL CONTEXT:
Field names must be unique across your entire application. Each field name can only be registered once.

CURRENT FIELD REGISTRY:
• Total registered fields: ${fields.size}
• All field names: [${Array.from(fields.keys()).join(", ")}]

=================================
  `);
}

export function createFieldStore({ persistence, emitter }: FieldStoreOptions = {}) {
  return new FieldStore(persistence ?? url(), emitter ?? createEventEmitter());
}
