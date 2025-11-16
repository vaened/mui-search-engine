/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder, type GenericRegisteredField } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { useEffect, useState } from "react";

export function useActiveFilters() {
  const { store } = useSearchBuilder();
  const [actives, setActives] = useState<GenericRegisteredField[]>([]);
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
    syncFromStore();
  }

  return { actives, hasActives, syncFromStore, clearAll };
}

function onlyHumanizables(field: GenericRegisteredField): boolean {
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
