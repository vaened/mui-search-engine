/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder, type GenericRegisteredField } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import type { HumanizedValue, Humanizer, ScalarFilterValue, ValueOf } from "@/field";
import { useEffect, useState } from "react";

type AnyHumanizedValue = HumanizedValue<any>;

export interface ActiveFilterTag {
  label: string;
  value?: ScalarFilterValue;
  field: GenericRegisteredField;
}

export function useActiveFilters() {
  const { store } = useSearchBuilder();
  const [actives, setActives] = useState<ActiveFilterTag[]>([]);
  const hasActives = actives.length > 0;

  useEffect(() => {
    const unsubscribe = store.onFieldSubmit(setActivesFrom);
    return () => unsubscribe();
  }, [store]);

  function setActivesFrom(fields: FieldsCollection) {
    setActives(
      fields.filter(onlyHumanizables).flatMap((field): ActiveFilterTag[] => {
        const humanized = createLabelFor(field, store.collection());
        return createTagsFrom(humanized, field);
      })
    );
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

function createLabelFor(field: GenericRegisteredField, fields: FieldsCollection): AnyHumanizedValue | undefined {
  const humanize = field.humanize as Humanizer<ValueOf<GenericRegisteredField>, AnyHumanizedValue> | undefined;
  return humanize ? humanize(field.value, fields) : undefined;
}

function createTagsFrom(value: AnyHumanizedValue | undefined, owner: GenericRegisteredField): ActiveFilterTag[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [
      {
        label: value,
        field: owner,
      },
    ];
  }

  return value.map(
    (value): ActiveFilterTag => ({
      value: value.value,
      label: value.label,
      field: owner,
    })
  );
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
