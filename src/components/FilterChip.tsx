/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder, type GenericRegisteredField } from "@/context";
import type { FieldsCollection } from "@/context/FieldsCollection";
import type { FilterValue, HumanizedValue, Humanizer, ValueOf } from "@/field";
import { Chip, type ChipProps } from "@mui/material";
import React from "react";

export type FilterChipProps = Omit<ChipProps, "label" | "onDelete" | "size"> & {
  field: GenericRegisteredField;
  readonly?: boolean;
  onRemove?: (field: GenericRegisteredField) => void;
};

type AnyHumanizedValue = HumanizedValue<any>;

function createLabelFor(field: GenericRegisteredField, fields: FieldsCollection): AnyHumanizedValue | undefined {
  const humanize = field.humanize as Humanizer<ValueOf<GenericRegisteredField>, AnyHumanizedValue> | undefined;
  return humanize ? humanize(field.value, fields) : undefined;
}

export const FilterChip: React.FC<FilterChipProps> = ({ field, readonly, onRemove, ...restOfProps }) => {
  const { store } = useSearchBuilder();

  const humanized = createLabelFor(field, store.collection());

  if (humanized === undefined || humanized === null || humanized.length === 0) {
    return null;
  }

  function remove(value?: FilterValue) {
    if (Array.isArray(field.value) && value !== undefined) {
      const newValue = field.value.filter((v) => v !== value);
      store.set(field.name, newValue);
    } else {
      store.set(field.name, null);
    }

    onRemove?.(field);
  }

  if (typeof humanized === "string") {
    return <Chip {...restOfProps} label={humanized} size="small" onDelete={readonly ? undefined : () => remove()} />;
  }

  return (
    <>
      {humanized.map((chip) => (
        <Chip
          {...restOfProps}
          key={`filter-chip-${field.name}-${chip.label}`}
          label={chip.label}
          size="small"
          onDelete={readonly ? undefined : () => remove(chip.value as FilterValue)}
        />
      ))}
    </>
  );
};

export default FilterChip;
