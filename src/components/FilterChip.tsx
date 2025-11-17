/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder, type GenericRegisteredField } from "@/context";
import type { ScalarFilterValue } from "@/field";
import type { ActiveFilterTag } from "@/hooks/useActiveFilters";
import { Chip, type ChipProps } from "@mui/material";
import React from "react";

export type FilterChipProps = Omit<ChipProps, "label" | "onDelete" | "size"> & {
  tag: ActiveFilterTag;
  readonly?: boolean;
  onRemove?: (field: GenericRegisteredField) => void;
};

export const FilterChip: React.FC<FilterChipProps> = ({ tag, readonly, onRemove, ...restOfProps }) => {
  const { store } = useSearchBuilder();
  const { field, value, label } = tag;

  function remove(value?: ScalarFilterValue) {
    const newValue = Array.isArray(field.value) ? field.value.filter((v) => v !== value) : null;
    store.set(field.name, newValue);

    onRemove?.(field);
  }

  return <Chip {...restOfProps} label={label} size="small" onDelete={readonly ? undefined : () => remove(value)} />;
};

export default FilterChip;
