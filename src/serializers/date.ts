import type { Serializer } from "@/field";
import { createSerializer } from "@/serializers/resolve";

export const dateSerializer: Serializer<Date> = {
  serialize(value: Date) {
    return value.toISOString();
  },

  unserialize(value: string) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  },
};

export const createDateSerializer = () => createSerializer(dateSerializer);
