/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { PrimitiveFilterDictionary } from "@/types";

export interface PersistenceAdapter {
  read(): PrimitiveFilterDictionary;
  write(values: PrimitiveFilterDictionary): void;
  subscribe(callback: () => void): () => void;
}
