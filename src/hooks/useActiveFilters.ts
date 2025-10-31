/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngine, type RegisteredField } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { useEffect, useState } from "react";

function onlyHumanizables(field: RegisteredField): boolean {
  const value = field.value;

  if (field.humanize === undefined || value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  return true;
}

export function useActiveFilters() {
  const { store } = useSearchEngine();
  const [actives, setActives] = useState<RegisteredField[]>([]);
  const hasActives = actives.length > 0;

  useEffect(() => {
    const unsubscribe = store.onFieldSubmit(setActivesFrom);
    return () => unsubscribe();
  }, [store]);

  function setActivesFrom(fields: FieldsCollection) {
    setActives(fields.filter(onlyHumanizables));
  }

  function syncFromStore() {
    setActivesFrom(store.collection());
  }

  function clearAll() {
    store.reset();
  }

  return { actives, hasActives, syncFromStore, clearAll };
}
