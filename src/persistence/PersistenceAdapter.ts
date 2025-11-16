/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { PrimitiveFilterDictionary } from "@/field";

export interface PersistenceAdapter {
  read(whitelist?: string[]): PrimitiveFilterDictionary;
  write(values: PrimitiveFilterDictionary, whitelist?: string[]): void;
  subscribe(callback: () => void): () => void;
}
