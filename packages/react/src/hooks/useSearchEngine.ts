/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useRef } from "react";
import { createFieldStore, FieldStore, type FieldStoreOptions } from "../context/FieldStore";
import { empty, url } from "../persistence";

type SearchEngineOptionsResolver = () => FieldStoreOptions;
type SearchEngineOptions = { persistInUrl: boolean };

export type UseSearchEngineProps = SearchEngineOptions | SearchEngineOptionsResolver;

export function useSearchEngine(options: SearchEngineOptions): FieldStore;
export function useSearchEngine(resolver: SearchEngineOptionsResolver): FieldStore;
export function useSearchEngine(arg: UseSearchEngineProps): FieldStore;
export function useSearchEngine(): FieldStore;

export function useSearchEngine(args: UseSearchEngineProps | undefined = undefined): FieldStore {
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

function isResolverFunction(arg: unknown): arg is SearchEngineOptionsResolver {
  return typeof arg === "function";
}
