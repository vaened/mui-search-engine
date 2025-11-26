import type { Serializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const stringSerializer: Serializer<string> = {
  serialize(value: string) {
    return value.toString();
  },
  unserialize(value: string) {
    return String(value);
  },
};

export const createStringSerializer = <T extends string>() => createSerializer<T>(stringSerializer as Serializer<T>);
