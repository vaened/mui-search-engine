/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { PrimitiveFilterDictionary } from "../field";
import type { PersistenceAdapter } from "../persistence/PersistenceAdapter";

export class EmptyPersistenceAdapter implements PersistenceAdapter {
  read(): PrimitiveFilterDictionary {
    return {};
  }

  write(): void {}

  subscribe(): () => void {
    return () => {};
  }
}
