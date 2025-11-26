/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useEffect, useRef } from "react";
import { createFieldStore, CreateStoreOptions, FieldStore } from "../context/FieldStore";

export function useResolveFieldStoreInstance(source?: FieldStore, fallback?: CreateStoreOptions): FieldStore {
  const instance = useRef<FieldStore | null>(null);

  useEffect(
    () => () => {
      instance.current?.clean?.();
      instance.current = null;
    },
    []
  );

  return source ? source : (instance.current ??= createFieldStore(fallback));
}
