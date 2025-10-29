/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FilterChip, { type FilterChipProps } from "@/components/FilterChip";
import type { RegisteredField } from "@/context";
import { useActiveFilters } from "@/hooks/useActiveFilters";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { IconRestore } from "@tabler/icons-react";
import React from "react";

export type ActiveFiltersBarProps = Omit<FilterChipProps, "field">;

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({ onRemove, ...restOfProps }) => {
  const { actives, hasActives, refresh, clearAll } = useActiveFilters();

  function onFilterChipRemove(field: RegisteredField) {
    refresh();
    onRemove?.(field);
  }

  return (
    <Grid size={12} borderLeft={5} borderColor="#cbcfd5" pl={1.5} container>
      <Grid lineHeight={1}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Applied Filters
        </Typography>
      </Grid>

      <Grid display="grid" gridTemplateColumns="1fr auto" width="100%" alignItems="center" container>
        {!hasActives && <Typography>No filters have been applied yet.</Typography>}

        {hasActives && (
          <Box display="flex" flexWrap="wrap" gap={1}>
            {actives.map((field) => (
              <FilterChip key={`filter-chip-group-${field.name}`} field={field} onRemove={onFilterChipRemove} {...restOfProps} />
            ))}
          </Box>
        )}

        <Box>
          <Tooltip title="Clear all filters" placement="left" arrow>
            <span>
              <IconButton onClick={clearAll} aria-label="delete" disabled={!hasActives}>
                <IconRestore size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ActiveFiltersBar;
