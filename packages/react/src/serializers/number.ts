import type { Serializer } from "@/field";
import { createSerializer } from "@/serializers/resolve";

export const numberSerializer: Serializer<number> = {
  serialize(value: number) {
    return value.toString();
  },

  unserialize(value: string) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
};

export const createNumberSerializer = <T extends number>() => createSerializer<T>(numberSerializer as Serializer<T>);
