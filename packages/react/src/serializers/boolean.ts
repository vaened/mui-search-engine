/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { SynchronousSerializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const booleanSerializer: SynchronousSerializer<boolean> = {
  serialize(value: boolean) {
    return value.toString();
  },

  unserialize(value: string) {
    return value === "true";
  },
};

export const createBooleanSerializer = () => createSerializer(booleanSerializer);
