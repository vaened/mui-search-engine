/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { Theme } from "@emotion/react";
import { Box, Grid, IconButton, Skeleton, Tooltip, Typography, type SxProps } from "@mui/material";
import type { GenericRegisteredField } from "@vaened/react-search-builder";
import { useActiveFilters, useSearchFormReady } from "@vaened/react-search-builder";
import React, { useMemo } from "react";
import { useMuiSearchBuilderConfig, type Translator } from "../config";
import FilterChip, { type FilterChipProps } from "./FilterChip";

export type ActiveFiltersBarProps = {
  chipProps?: Omit<FilterChipProps, "tag" | "readonly">;
  readonly?: boolean;
  untitled?: boolean;
  unstyled?: boolean;
  limitTags?: number;
  disableAutoSubmit?: boolean;
  preserveFieldsOrder?: boolean;
  sx?: SxProps<Theme>;
  labels?: {
    filtersLabel?: string;
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
  limitTags = 10,
  disableAutoSubmit,
  preserveFieldsOrder,
  sx,
  chipProps: { onRemove, ...restOfProps } = {},
}) => {
  const isReady = useSearchFormReady();
  const { translate, icon } = useMuiSearchBuilderConfig();
  const { hasActives, actives, syncFromStore, clearAll } = useActiveFilters({ preserveFieldsOrder });
  const { filtersLabel, headerTitle, emptyStateMessage, clearAllButtonTooltip } = useFilterBarTranslations(translate, labels);

  const tags = useMemo(() => actives.slice(0, limitTags ?? actives.length), [actives, limitTags]);
  const restOfTagNumber = actives.length - tags.length;

  function onFilterChipRemove(field: GenericRegisteredField) {
    if (disableAutoSubmit) {
      syncFromStore();
    }

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
        {!isReady && <Skeleton variant="text" sx={{ fontSize: "19.5px" }} />}

        {isReady && !hasActives && <Typography>{emptyStateMessage}</Typography>}

        {isReady && hasActives && (
          <Box display="flex" flexWrap="wrap" gap={1}>
            {tags.map((tag, index) => (
              <FilterChip
                key={`filter-chip-group-${tag.field.name}-${index}`}
                tag={tag}
                readonly={readonly}
                disableAutoSubmit={disableAutoSubmit}
                onRemove={onFilterChipRemove}
                {...restOfProps}
              />
            ))}

            {restOfTagNumber > 0 && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ userSelect: "none" }}>
                <Typography fontWeight="600">+{restOfTagNumber}</Typography>
                <Typography color="text.secondary">{filtersLabel}</Typography>
              </Box>
            )}
          </Box>
        )}

        {!readonly && (
          <Box>
            <Tooltip title={clearAllButtonTooltip} placement="left" arrow>
              <span>
                <IconButton
                  onClick={clearAll}
                  aria-label={clearAllButtonTooltip || "Clear all filters"}
                  disabled={!hasActives}
                  data-testid="clear-all-filters-trigger-button">
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
      filtersLabel: translate("global.filtersLabel", {
        text: labels?.filtersLabel,
        fallback: "Filters",
      }),
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
