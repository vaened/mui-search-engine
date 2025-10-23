/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { SerializedFilterDictionary } from "@/types";

export interface PersistenceAdapter {
  read(): SerializedFilterDictionary;
  write(values: SerializedFilterDictionary): void;
  subscribe(callback: () => void): () => void;
}
