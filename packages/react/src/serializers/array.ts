/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FilterValue, SerializeReturnType, SynchronousSerializer } from "../field";

export function createArraySerializer<V extends FilterValue>(serializer: SynchronousSerializer<V>) {
  return {
    serialize(value: V[]): string[] {
      return value.map((v) => serializer.serialize(v) as string);
    },
    unserialize(value: string[]): V[] {
      const values = value.map((v) => serializer.unserialize(v as SerializeReturnType<V>));
      return values.filter((v) => v !== undefined);
    },
  } as SynchronousSerializer<V[]>;
}
