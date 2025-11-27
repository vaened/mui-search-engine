/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

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
