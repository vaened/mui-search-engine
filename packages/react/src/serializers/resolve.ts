/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FilterTypeKey, FilterValue, SerializeReturnType, SynchronousSerializer } from "../field";
import { createArraySerializer } from "../serializers/array";
import { booleanSerializer } from "../serializers/boolean";
import { dateSerializer } from "../serializers/date";
import { numberSerializer } from "../serializers/number";
import { stringSerializer } from "../serializers/string";
export { createArraySerializer } from "./array";

export function createSerializer<T>(serializer: SynchronousSerializer<T>): SynchronousSerializer<T> {
  return {
    serialize: (value: T) => serializer.serialize(value) as SerializeReturnType<T>,
    unserialize: (value: SerializeReturnType<T>) => serializer.unserialize(value) as NoInfer<T>,
  };
}

export default function resolve(type: FilterTypeKey): SynchronousSerializer<FilterValue> {
  switch (type) {
    case "string":
      return stringSerializer;
    case "boolean":
      return booleanSerializer;
    case "number":
      return numberSerializer;
    case "date":
      return dateSerializer;
    case "string[]":
      return createArraySerializer(stringSerializer);
    case "boolean[]":
      return createArraySerializer(booleanSerializer);
    case "number[]":
      return createArraySerializer(numberSerializer);
    case "date[]":
      return createArraySerializer(dateSerializer);
  }

  throw new Error(`Cannot auto-resolve serializer for type "${type}"`);
}
