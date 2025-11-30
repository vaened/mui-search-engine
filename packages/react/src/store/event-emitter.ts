/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { FieldsCollection } from "./FieldsCollection";
import type { FieldStoreState } from "./FieldStore";

export type Events = {
  persist: FieldsCollection;
  change: FieldStoreState;
};

export type Unsubscribe = () => void;

export interface EventEmitter<TEvents extends Record<string, unknown> = Events> {
  on<K extends keyof TEvents>(type: K, handler: (p: TEvents[K]) => void): Unsubscribe;
  off<K extends keyof TEvents>(type: K, handler: (p: TEvents[K]) => void): void;
  emit<K extends keyof TEvents>(type: K, payload: TEvents[K]): void;
}

export function createEventEmitter<TEvents extends Record<string, unknown> = Events>(): EventEmitter<TEvents> {
  const map = new Map<keyof TEvents, Set<Function>>();

  function on<K extends keyof TEvents>(type: K, handler: (p: TEvents[K]) => void): Unsubscribe {
    let set = map.get(type);

    if (!set) {
      set = new Set();
      map.set(type, set);
    }

    set.add(handler);

    return () => set.delete(handler);
  }

  function off<K extends keyof TEvents>(type: K, handler: (p: TEvents[K]) => void) {
    map.get(type)?.delete(handler);
  }

  function emit<K extends keyof TEvents>(type: K, payload: TEvents[K]) {
    const set = map.get(type);

    if (!set || set.size === 0) {
      return;
    }

    [...set].forEach((fn) => (fn as (p: TEvents[K]) => void)(payload));
  }

  return { on, off, emit };
}
