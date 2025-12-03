/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { SynchronousSerializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const numberSerializer: SynchronousSerializer<number> = {
  serialize(value: number) {
    return value.toString();
  },

  unserialize(value: string) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
};

export const createNumberSerializer = <T extends number>() => createSerializer<T>(numberSerializer as SynchronousSerializer<T>);
