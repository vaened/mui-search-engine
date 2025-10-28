import type { RegisteredField, RegisteredFieldDictionary } from "@/context";
import type { FilterName, FilterValue, PrimitiveFilterDictionary, PrimitiveValue, ValueFilterDictionary } from "@/types";

export class FieldsCollection implements Iterable<RegisteredField> {
  #values: RegisteredFieldDictionary;

  constructor(values: RegisteredFieldDictionary) {
    this.#values = values;
  }

  public static from = (values: RegisteredFieldDictionary) => new FieldsCollection(values);

  public static empty = () => FieldsCollection.from(new Map());

  public size = () => this.#values.size;

  public toArray = (): Array<RegisteredField> => Array.from(this);

  public toMap = (): RegisteredFieldDictionary => new Map(this.#values);

  public toRecord = (): Record<FilterName, RegisteredField> => Object.fromEntries(this.#values);

  public toValues = (): ValueFilterDictionary => {
    return this.#collect((field) => field.value);
  };

  public toPrimitives = (): PrimitiveFilterDictionary => {
    return this.#collect((field) => (field.serialize ? field.serialize(field.value) : (field.value as PrimitiveValue)));
  };

  public onlyActives = (): RegisteredField[] => {
    return this.filter((field) => FieldsCollection.isValidValue(field.value));
  };

  public has = (name: FilterName): boolean => {
    return this.#values.has(name);
  };

  public get = <V extends FilterValue, P extends PrimitiveValue>(name: FilterName): RegisteredField<V, P> | undefined => {
    return this.#values.get(name) as unknown as RegisteredField<V, P> | undefined;
  };

  public map = <V extends unknown>(mapper: (field: RegisteredField) => V): V[] => {
    const values: V[] = [];

    for (const field of this) {
      values.push(mapper(field));
    }

    return values;
  };

  public filter = (predicate: (field: RegisteredField) => boolean): RegisteredField[] => {
    const values: RegisteredField[] = [];

    for (const field of this) {
      if (predicate(field)) {
        values.push(field);
      }
    }

    return values;
  };

  public forEach = (callback: (field: RegisteredField) => void) => {
    this.#values.forEach(callback);
  };

  public static isValidValue = (value: unknown) => {
    return value !== undefined && value !== null;
  };

  public [Symbol.iterator]() {
    return this.#values.values();
  }

  #collect = <T>(collector: (field: RegisteredField) => T): Record<FilterName, T> => {
    const result = {} as Record<FilterName, T>;

    this.forEach((field) => {
      const value = collector(field);

      if (!FieldsCollection.isValidValue(value)) {
        return;
      }

      result[field.name] = value;
    });

    return result;
  };
}
