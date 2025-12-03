/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { SynchronousSerializer } from "../field";
import { createSerializer } from "../serializers/resolve";

export const stringSerializer: SynchronousSerializer<string> = {
  serialize(value: string) {
    return value.toString();
  },
  unserialize(value: string) {
    return String(value);
  },
};

export const createStringSerializer = <T extends string>() => createSerializer<T>(stringSerializer as SynchronousSerializer<T>);
