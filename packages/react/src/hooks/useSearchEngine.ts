/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useRef } from "react";
import { createFieldStore, FieldStore, type FieldStoreOptions } from "../context/FieldStore";
import { empty, url } from "../persistence";

type SearchStoreOptionsResolver = () => FieldStoreOptions;
type SearchStoreOptions = { persistInUrl: boolean };

export type UseSearchStoreProps = SearchStoreOptions | SearchStoreOptionsResolver;

export function useSearchStore(options: SearchStoreOptions): FieldStore;
export function useSearchStore(resolver: SearchStoreOptionsResolver): FieldStore;
export function useSearchStore(arg: UseSearchStoreProps): FieldStore;
export function useSearchStore(): FieldStore;

export function useSearchStore(args: UseSearchStoreProps | undefined = undefined): FieldStore {
  const instance = useRef<FieldStore | null>(null);

  switch (true) {
    case instance.current !== null:
      break;

    case args === undefined:
      instance.current ??= createFieldStore();
      break;

    case isResolverFunction(args):
      instance.current ??= createFieldStore(args());
      break;

    default:
      instance.current ??= createFieldStore({
        persistence: args.persistInUrl ? url() : empty(),
      });
      break;
  }

  return instance.current;
}

function isResolverFunction(arg: unknown): arg is SearchStoreOptionsResolver {
  return typeof arg === "function";
}
