import { createSerializer } from "@/serializers/resolve";
import type { Serializer } from "@/field";

export const dateSerializer: Serializer<Date> = {
  serialize(value: Date) {
    return value.toISOString();
  },

  unserialize(value: string) {
    return new Date(value);
  },
};

export const createDateSerializer = () => createSerializer(dateSerializer);
