/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { SynchronousSerializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const dateSerializer: SynchronousSerializer<Date> = {
  serialize(value: Date) {
    return value.toISOString();
  },

  unserialize(value: string) {
    const asNumber = Number(value);
    const date = !isNaN(asNumber) && value.trim() !== "" ? new Date(asNumber) : new Date(value);

    return isNaN(date.getTime()) ? undefined : date;
  },
};

export const createDateSerializer = () => createSerializer(dateSerializer);
