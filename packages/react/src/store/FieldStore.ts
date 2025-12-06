/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { GenericRegisteredField, RegisteredField, RegisteredFieldDictionary, RegisteredFieldValue } from ".";
import type {
  FieldOptions,
  FilterName,
  FilterTypeKey,
  FilterTypeMap,
  FilterValue,
  GenericField,
  PrimitiveFilterDictionary,
  PrimitiveValue,
} from "../field";
import { empty, url } from "../persistence";
import type { PersistenceAdapter } from "../persistence/PersistenceAdapter";
import { FieldsCollection } from "./FieldsCollection";
import { createEventEmitter, type EventEmitter, type Unsubscribe } from "./event-emitter";
import { createTaskMonitor, TaskMonitor } from "./task-monitor";

type SerializedValue = string & string[];
export type FieldOperation = "set" | "flush" | "update" | "hydrate" | "unregister" | "register" | "rehydrate" | "sync" | "reset" | null;

export type FieldStoreConfig = {
  persistence?: PersistenceAdapter;
  emitter?: EventEmitter;
};

type CreateStoreConfigResolver = () => FieldStoreConfig;
type CreateStoreQuickOptions = { persistInUrl: boolean };
export type CreateStoreOptions = FieldStoreConfig | CreateStoreQuickOptions | CreateStoreConfigResolver;

export type AsynchronousValue = { deferred: true; hydrated: Promise<RegisteredFieldValue> };
export type SynchronousValue = { deferred: false; hydrated: RegisteredFieldValue };
export type ParseValue = AsynchronousValue | SynchronousValue;

export type HydratorResponse = { label: string; value: FilterValue };

export type FieldStoreState = Readonly<{
  collection: FieldsCollection;
  operation: FieldOperation;
  touched: FilterName[];
  isHydrating: boolean;
}>;

export class FieldStore {
  readonly #persistence: PersistenceAdapter;
  readonly #emitter: EventEmitter;
  readonly #tracker: TaskMonitor;

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
    this.#tracker = createTaskMonitor();
  }

  state = () => this.#state;

  exists = (name: FilterName) => this.#fields.has(name);

  collection = () => this.#state.collection;

  isHydrating = () => this.#tracker.isHydrating();

  whenReady = (name: string, task: () => void) => this.#tracker.whenReady(name, task);

  subscribe = (listener: () => void): Unsubscribe => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  listen = <TKey extends FilterTypeKey, TValue extends FilterTypeMap[TKey]>(
    name: FilterName
  ): (() => RegisteredField<TKey, TValue> | undefined) => {
    return () => this.#state.collection.get(name) as RegisteredField<TKey, TValue> | undefined;
  };

  sync = async (): Promise<void> => {
    const newValues = this.#persistence.read();
    const touched: FilterName[] = [];
    const hydrators: Record<FilterName, Promise<FilterValue>> = {};

    for (const field of this.#fields.values()) {
      const { deferred, hydrated } = this.#parse(newValues[field.name], field);

      if (deferred) {
        this.#tracker.capture();
        this.#override(field, { isHydrating: true });
        hydrators[field.name] = hydrated;
        continue;
      }

      if (this.#isDirty(field, hydrated)) {
        this.#override(field, { value: hydrated });
        touched.push(field.name);
      }
    }

    const deferredFieldNames = Object.keys(hydrators);

    if (touched.length === 0 && deferredFieldNames.length === 0) {
      return;
    }

    this.#commit();

    const results = await Promise.allSettled(Object.values(hydrators));

    results.forEach((result, index) => {
      const field = this.#fields.get(deferredFieldNames[index]);
      const isSucessful = result.status === "fulfilled";

      if (field === undefined) {
        return;
      }

      this.#tracker.release();
      const value = (!isSucessful ? field.value : result.value) ?? field.defaultValue;

      if (isSucessful && this.#isDirty(field, result.value)) {
        touched.push(field.name);
      }

      this.#override(field, {
        value,
        isHydrating: false,
      });
    });

    if (touched.length === 0) {
      return;
    }

    this.#commit({ operation: "sync", touched });
  };

  persist = () => {
    const collection = this.#state.collection;
    this.#persistence.write(collection.toPrimitives(), this.#whitelist);
    this.#emitter.emit("persist", collection);
  };

  rehydrate = (newValues: PrimitiveFilterDictionary): FieldsCollection | undefined => {
    const touched: FilterName[] = [];
    let someFieldIsDeferred = false;

    this.#fields.forEach((field) => {
      const parsed = this.#parse(newValues[field.name], field);
      const { deferred, hydrated } = parsed;
      someFieldIsDeferred = someFieldIsDeferred || deferred;

      this.#process(field, parsed);

      if (!deferred && this.#isDirty(field, hydrated)) {
        this.#override(field, { value: hydrated });
        touched.push(field.name);
      }

      if (deferred) {
        this.#override(field, { isHydrating: true });
      }
    });

    if (touched.length > 0) {
      const collection = new FieldsCollection(this.#fields);

      this.#commit({ operation: "rehydrate", collection, touched });

      return collection;
    }

    if (someFieldIsDeferred) {
      this.#commit();
    }

    return;
  };

  register<F extends GenericField>(field: F): void {
    if (this.exists(field.name)) {
      throwAlreadyRegisteredErrorFor(field, this.#fields);
    }

    const defaultValue = field.value;
    const persistedValue = this.#initial[field.name];
    const parsed = this.#parse(persistedValue, { defaultValue, serializer: field.serializer });
    const { deferred, hydrated } = parsed;
    const value = deferred ? defaultValue : hydrated;

    const registered = {
      ...field,
      value,
      defaultValue,
      updatedAt: Date.now(),
      isHydrating: deferred,
    } as GenericRegisteredField;

    this.#process(registered, parsed);
    this.#whitelist.push(field.name);
    this.#fields.set(field.name, registered);

    this.#commit({
      operation: "register",
      collection: new FieldsCollection(this.#fields),
    });
  }

  unregister = (name: FilterName) => {
    const field = this.#fields.get(name);

    if (!field) {
      return;
    }

    this.#fields.delete(name);
    this.#whitelist = this.#whitelist.filter((field) => field !== name);

    if (field.isHydrating) {
      this.#tracker.release();
    }

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

  set = (name: FilterName, value: RegisteredFieldValue) => {
    this.#apply(name, value, "set");
  };

  flush = (name: FilterName, value: RegisteredFieldValue) => {
    this.#apply(name, value, "flush");
  };

  reset = () => {
    const touched: FilterName[] = [];

    this.#fields.forEach((field) => {
      if (!Object.is(field.value, field.defaultValue)) {
        this.#override(field, {
          value: field.defaultValue as RegisteredFieldValue,
        });
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

  onPersistenceChange = (listener: (state: FieldStoreState) => void): Unsubscribe => {
    return this.#persistence.subscribe(async () => {
      await this.sync();
      listener(this.#state);
    });
  };

  onFieldPersisted = (listener: (fields: FieldsCollection) => void): Unsubscribe => {
    return this.#emitter.on("persist", listener);
  };

  onStateChange = (listener: (state: FieldStoreState) => void): Unsubscribe => {
    return this.#emitter.on("change", (state) => listener(state));
  };

  #apply(name: FilterName, value: RegisteredFieldValue | null, operation: Extract<FieldOperation, "set" | "flush">) {
    const field = this.#fields.get(name);

    if (!field || Object.is(field.value, value)) {
      return;
    }

    this.#override(field, { value: value as RegisteredFieldValue });

    this.#commit({ operation, touched: [name], collection: new FieldsCollection(this.#fields) });
  }

  #process = ({ name, defaultValue }: Pick<GenericRegisteredField, "name" | "defaultValue">, { deferred, hydrated }: ParseValue) => {
    if (!deferred) {
      return;
    }

    this.#tracker.capture();

    hydrated
      .then((value) => value ?? defaultValue)
      .catch(() => defaultValue)
      .then((value) => {
        const field = this.#fields.get(name);

        if (!field) {
          return;
        }

        this.#tracker.release();

        if (!this.#isDirty(field, value)) {
          this.#override(field, { isHydrating: false });
          this.#commit({
            collection: new FieldsCollection(this.#fields),
          });

          return;
        }

        this.#override(field, {
          value,
          isHydrating: false,
        });

        this.#commit({
          operation: "hydrate",
          collection: new FieldsCollection(this.#fields),
        });
      });
  };

  #commit = (state: Partial<FieldStoreState> = {}) => {
    const operation = state.operation ?? null;
    const touched = state.touched ?? [];
    const collection = state.collection ?? new FieldsCollection(this.#fields);

    this.#state = {
      ...this.#state,
      operation,
      touched,
      collection,
      isHydrating: this.#tracker.isHydrating(),
    };

    this.#listeners.forEach((listener) => listener());
    this.#emitter.emit("change", this.#state);
  };

  #parse = <T extends GenericRegisteredField>(newValue: PrimitiveValue, field: Pick<T, "defaultValue" | "serializer">): ParseValue => {
    if (newValue === undefined || newValue === null || !field.serializer.unserialize) {
      return {
        deferred: false,
        hydrated: field.defaultValue,
      };
    }

    const hydrated = field.serializer.unserialize(newValue as SerializedValue);
    const deferred = hydrated instanceof Promise;

    return { deferred, hydrated } as ParseValue;
  };

  #override<F extends GenericRegisteredField>(field: F, partial: Partial<Pick<F, "value" | "isHydrating">>): void {
    this.#fields.set(field.name, {
      ...(field as F),
      updatedAt: Date.now(),
      ...partial,
    });
  }

  #isDirty = (field: GenericRegisteredField, value: FilterValue) => {
    return !Object.is(field.value, value);
  };

  #initialState = (): FieldStoreState => ({
    collection: FieldsCollection.empty(),
    touched: [],
    operation: null,
    isHydrating: false,
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

export function newLabeledPromise<T = FilterValue>(label: string, promise: Promise<T>) {
  return {
    async resolver() {
      return {
        label,
        value: await promise,
      };
    },
  };
}

export function createFieldStore(options: CreateStoreQuickOptions): FieldStore;
export function createFieldStore(config: FieldStoreConfig): FieldStore;
export function createFieldStore(resolver: CreateStoreConfigResolver): FieldStore;
export function createFieldStore(arg: CreateStoreOptions | undefined): FieldStore;
export function createFieldStore(): FieldStore;

export function createFieldStore(args: CreateStoreOptions | undefined = undefined): FieldStore {
  if (args === undefined) {
    return create();
  }

  if (isResolverFunction(args)) {
    return create(args());
  }

  if (isStoreOptionsObject(args)) {
    return create({ persistence: args.persistInUrl ? url() : empty() });
  }

  return create(args);
}

function create({ persistence = undefined, emitter = undefined }: FieldStoreConfig = {}): FieldStore {
  return new FieldStore(persistence ?? empty(), emitter ?? createEventEmitter());
}

function isResolverFunction(arg: unknown): arg is CreateStoreConfigResolver {
  return typeof arg === "function";
}

function isStoreOptionsObject(arg: unknown): arg is CreateStoreQuickOptions {
  return typeof arg === "object" && arg !== null && "persistInUrl" in arg;
}
