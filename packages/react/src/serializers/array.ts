import type { FilterValue, Serializer, SerializeReturnType } from "@/field";

export function createArraySerializer<V extends FilterValue>(serializer: Serializer<V>) {
  return {
    serialize(value: V[]): string[] {
      return value.map((v) => serializer.serialize(v) as string);
    },
    unserialize(value: string[]): V[] {
      const values = value.map((v) => serializer.unserialize(v as SerializeReturnType<V>));
      return values.filter((v) => v !== undefined);
    },
  } as Serializer<V[]>;
}
