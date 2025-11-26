import type { Serializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const booleanSerializer: Serializer<boolean> = {
  serialize(value: boolean) {
    return value.toString();
  },

  unserialize(value: string) {
    return value === "true";
  },
};

export const createBooleanSerializer = () => createSerializer(booleanSerializer);
