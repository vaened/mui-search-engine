/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder, type RegisteredField } from "@/context";
import type { FilterValue, IndexedFilterChip, InputValue } from "@/types";
import { Chip, type ChipProps } from "@mui/material";
import React from "react";

export type FilterChipProps = Omit<ChipProps, "label" | "onDelete" | "size"> & {
  field: RegisteredField;
  readonly?: boolean;
  onRemove?: (field: RegisteredField) => void;
};

function isIndexedChipArray(value: unknown): value is IndexedFilterChip<InputValue[]>[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && "value" in value[0];
}

export const FilterChip: React.FC<FilterChipProps> = ({ field, readonly, onRemove, ...restOfProps }) => {
  const { store } = useSearchBuilder();

  const humanized = field.humanize?.(field.value, store.collection());

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

  if (!isIndexedChipArray(humanized)) {
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
          onDelete={readonly ? undefined : () => remove(chip.value)}
        />
      ))}
    </>
  );
};

export default FilterChip;
