import { EmptyPersistenceAdapter } from "./EmptyPersistenceAdapter";
import { UrlPersistenceAdapter } from "./UrlPersistenceAdapter";

export function url() {
  return new UrlPersistenceAdapter();
}

export function empty() {
  return new EmptyPersistenceAdapter();
}

export { EmptyPersistenceAdapter, UrlPersistenceAdapter };
