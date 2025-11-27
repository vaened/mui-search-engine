/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { CreateStoreOptions, FieldStore } from "../store";
import { useResolveFieldStoreInstance } from "./useResolveFieldStoreInstance";

export function useSearchStore(args: CreateStoreOptions | undefined = undefined): FieldStore {
  return useResolveFieldStoreInstance(undefined, args);
}
