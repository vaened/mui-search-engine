/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import type { PrimitiveFilterDictionary } from "@/types";

export class EmptyPersistenceAdapter implements PersistenceAdapter {
  read(): PrimitiveFilterDictionary {
    return {};
  }

  write(values: PrimitiveFilterDictionary): void {}

  subscribe(callback: () => void): () => void {
    return () => {};
  }
}
