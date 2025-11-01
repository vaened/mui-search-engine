/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FilterChip, { type FilterChipProps } from "@/components/FilterChip";
import { useSearchEngineConfig, type Translator } from "@/config";
import type { RegisteredField } from "@/context";
import { useActiveFilters } from "@/hooks/useActiveFilters";
import type { Theme } from "@emotion/react";
import { Box, Grid, IconButton, Tooltip, Typography, type SxProps } from "@mui/material";
import React, { useMemo } from "react";

export type ActiveFiltersBarProps = {
  chipProps?: Omit<FilterChipProps, "field" | "readonly">;
  readonly?: boolean;
  untitled?: boolean;
  unstyled?: boolean;
  sx?: SxProps<Theme>;
  labels?: {
    headerTitle?: string;
    emptyStateMessage?: string;
    clearAllButtonTooltip?: string;
  };
};

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  labels,
  readonly,
  untitled,
  unstyled,
  sx,
  chipProps: { onRemove, ...restOfProps } = {},
}) => {
  const { translate, icon } = useSearchEngineConfig();
  const { actives, hasActives, syncFromStore, clearAll } = useActiveFilters();
  const { headerTitle, emptyStateMessage, clearAllButtonTooltip } = useFilterBarTranslations(translate, labels);

  function onFilterChipRemove(field: RegisteredField) {
    syncFromStore();
    onRemove?.(field);
  }

  return (
    <Grid
      size={12}
      borderLeft={unstyled ? undefined : 5}
      borderColor={unstyled ? undefined : "#cbcfd5"}
      pl={unstyled ? undefined : 1.5}
      sx={sx}
      container>
      {untitled || (
        <Grid lineHeight={1}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            {headerTitle}
          </Typography>
        </Grid>
      )}

      <Grid display="grid" gridTemplateColumns="1fr auto" width="100%" alignItems="center" container>
        {!hasActives && <Typography>{emptyStateMessage}</Typography>}

        {hasActives && (
          <Box display="flex" flexWrap="wrap" gap={1}>
            {actives.map((field) => (
              <FilterChip
                key={`filter-chip-group-${field.name}`}
                field={field}
                readonly={readonly}
                onRemove={onFilterChipRemove}
                {...restOfProps}
              />
            ))}
          </Box>
        )}

        {!readonly && (
          <Box>
            <Tooltip title={clearAllButtonTooltip} placement="left" arrow>
              <span>
                <IconButton onClick={clearAll} aria-label="delete" disabled={!hasActives}>
                  {icon("activeFiltersClearAllIcon")}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

function useFilterBarTranslations(translate: Translator, labels: ActiveFiltersBarProps["labels"]) {
  return useMemo(
    () => ({
      headerTitle: translate("activeFiltersBar.title", {
        text: labels?.headerTitle,
        fallback: "Active Filters",
      }),
      emptyStateMessage: translate("activeFiltersBar.noFilters", {
        text: labels?.emptyStateMessage,
        fallback: "No filters have been applied yet.",
      }),
      clearAllButtonTooltip: translate("activeFiltersBar.clearAllTooltip", {
        text: labels?.clearAllButtonTooltip,
        fallback: "Clear all filters",
      }),
    }),
    [labels]
  );
}

export default ActiveFiltersBar;
