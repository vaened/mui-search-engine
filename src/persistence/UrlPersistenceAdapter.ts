/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { PersistenceAdapter } from "@/persistence/PersistenceAdapter";
import type { SerializedFilterDictionary } from "@/types";

export class UrlPersistenceAdapter implements PersistenceAdapter {
  constructor() {
    if (typeof window === "undefined") {
      throw new Error("UrlPersistenceAdapter can only be used in a browser environment");
    }
  }

  read = (): SerializedFilterDictionary => {
    const params = new URLSearchParams(window.location.search);
    const keys = new Set(params.keys());
    const values: SerializedFilterDictionary = {};

    keys.forEach((key) => {
      if (key.endsWith("[]")) {
        const realKey = key.slice(0, -2);

        values[realKey] = params.getAll(key);
      } else {
        values[key] = params.get(key) as string;
      }
    });

    return values;
  };

  write = (values: SerializedFilterDictionary) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const values = [...value].sort();

        values.forEach((v) => {
          if (!this.#isValid(v)) {
            return;
          }

          params.append(`${key}[]`, String(v));
        });

        return;
      }

      if (this.#isValid(value)) {
        params.append(key, String(value));
      }
    });

    const newSearch = params.toString();
    const oldSearch = new URLSearchParams(window.location.search).toString();

    if (newSearch === oldSearch) {
      return;
    }

    const newPath = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
    window.history.pushState({ path: newPath }, "", newPath);
  };

  subscribe = (callback: () => void) => {
    window.addEventListener("popstate", callback);

    return () => {
      window.removeEventListener("popstate", callback);
    };
  };

  #isValid = (value: unknown) => {
    return value !== undefined && value !== null;
  };
}
