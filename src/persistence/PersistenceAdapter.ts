import type { SerializedFilterDictionary } from "@/types";

export interface PersistenceAdapter {
  read(): SerializedFilterDictionary;
  write(values: SerializedFilterDictionary): void;
}
