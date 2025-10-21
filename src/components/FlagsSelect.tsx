/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngineField } from "@/hooks/useSearchEngineField";
import type { FilterBag, FilterDictionary, FilterElement, FilterName, InputSize } from "@/types";
import { createFilterDictionaryFrom } from "@/utils";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel, { type FormControlLabelProps } from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconEraser, IconFilter, IconFilterOff } from "@tabler/icons-react";
import React, { useMemo, useRef, useState } from "react";

export type AdditiveFilterFlagBag<N extends FilterName> = Record<N, boolean>;

export interface FlagFilterValue<N extends FilterName> {
  additives: AdditiveFilterFlagBag<N>;
  exclusive?: N | null;
}

export interface FlagConfiguration<N extends FilterName> {
  additives?: FilterBag<N>;
  exclusives?: FilterBag<N>;
}

export interface FlagDictionary<N extends FilterName> {
  additives?: FilterDictionary<N>;
  exclusives?: FilterDictionary<N>;
}

export type FlagsBag<N extends FilterName> = FilterBag<N> | FlagConfiguration<N>;

export interface FlagsSelectProps<N extends FilterName> {
  name?: FilterName;
  tooltip?: string;
  size?: InputSize;
  options: FlagsBag<N>;
  defaultValue?: N[];
  compact?: boolean;
  onChange?: (flags: N[]) => void;
}

export function FlagsSelect<N extends FilterName>({
  name = "flags",
  options,
  size = "medium",
  tooltip = "Select Filters",
  defaultValue,
  onChange,
}: FlagsSelectProps<N>) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const dictionary = useMemo(() => createDictionary(options), [options]);

  const [open, setMenuOpenStatus] = useState(false);
  const { value, set } = useSearchEngineField({
    name,
    defaultValue,
    serialize: (flags) => flags,
    unserialize: async (flags) => flags,
  });

  const filters: FlagFilterValue<N> = useMemo(() => parseValue(value, dictionary), [value]);
  const hasFilter = value && value.length;

  const openMenu = () => setMenuOpenStatus(true);
  const closeMenu = () => setMenuOpenStatus(false);

  function process(filters: FlagFilterValue<N>) {
    let flags = Object.entries<boolean>(filters.additives).reduce<N[]>((acc, [flag, checked]) => {
      if (checked) {
        acc.push(flag as N);
      }

      return acc;
    }, []);

    if (filters.exclusive) {
      flags.push(filters.exclusive);
    }

    set(flags);
    onChange?.(flags);
  }

  function onAdditivesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;

    process({
      ...filters,
      additives: {
        ...filters.additives,
        [name]: checked,
      },
    });
  }

  function onExclusivesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    process({
      ...filters,
      exclusive: value as N,
    });
  }

  function cleanExclusivesFilter() {
    process({
      ...filters,
      exclusive: null,
    });
  }

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          onClick={openMenu}
          ref={anchorRef}
          size={size}
          sx={{ p: "6px" }}
          color={hasFilter ? "primary" : "inherit"}
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true">
          {hasFilter ? <IconFilter /> : <IconFilterOff />}
        </IconButton>
      </Tooltip>

      <Menu onClose={closeMenu} open={open} anchorEl={anchorRef.current} aria-labelledby="composition-button">
        <ListSubheader>Available Flags</ListSubheader>

        {dictionary.additives &&
          Object.values<FilterElement<N>>(dictionary.additives).map(({ value, label, description }, index) => (
            <MenuItemAction
              key={`${value}-${index}`}
              label={label}
              description={description}
              control={<Checkbox size="small" name={value} onChange={onAdditivesChange} checked={filters.additives[value] ?? false} />}
            />
          ))}

        {dictionary.additives && dictionary.exclusives && <Divider className="!my-0" />}

        {dictionary.exclusives && (
          <RadioGroup value={filters.exclusive || ""} onChange={onExclusivesChange}>
            {Object.values<FilterElement<N>>(dictionary.exclusives).map(({ value, label, description }, index) => (
              <MenuItemAction
                key={`${value}-${index}`}
                label={label}
                description={description}
                control={<Radio size="small" value={value} />}
              />
            ))}
          </RadioGroup>
        )}

        {dictionary.exclusives && (
          <Divider textAlign="right" variant="middle" className="!my-0">
            <Button
              variant="text"
              size="small"
              onClick={cleanExclusivesFilter}
              disabled={!filters.exclusive}
              color={!filters.exclusive ? "inherit" : "info"}>
              <Typography component="span" display="flex" sx={{ fontSize: 12 }} textTransform="capitalize">
                Restart
              </Typography>
              <IconEraser size={13} style={{ marginLeft: 5 }} />
            </Button>
          </Divider>
        )}
      </Menu>
    </>
  );
}

function MenuItemAction(props: FormControlLabelProps & { description?: string }) {
  return (
    <MenuItem sx={{ p: 0 }} dense>
      <Tooltip title={props.description} placement="left">
        <FormControlLabel {...props} sx={{ mx: 1, minWidth: "100%" }} />
      </Tooltip>
    </MenuItem>
  );
}

function hasAdditive<N extends FilterName>(x: FlagsBag<N>): x is { additives: FilterBag<N> } {
  return typeof x === "object" && !!x && "additives" in x && typeof x.additives === "object" && x.additives !== null;
}

function hasExclusive<N extends FilterName>(x: FlagsBag<N>): x is { exclusives: FilterBag<N> } {
  return typeof x === "object" && !!x && "exclusives" in x && typeof x.exclusives === "object" && x.exclusives !== null;
}

function isFlagConfiguration<N extends FilterName>(x: FlagsBag<N>): x is FlagConfiguration<N> {
  return hasAdditive<N>(x) && hasExclusive<N>(x);
}

function parseValue<N extends FilterName>(value: N[] | undefined, bag: FlagConfiguration<N>): FlagFilterValue<N> {
  if (!value) {
    return { additives: {} as AdditiveFilterFlagBag<N>, exclusive: null };
  }

  const exclusive = value.find((flag) => bag?.exclusives?.hasOwnProperty(flag));
  const additives = value.reduce<AdditiveFilterFlagBag<N>>((acc, flag) => {
    acc[flag] = bag.additives?.hasOwnProperty(flag) ?? false;
    return acc;
  }, {} as AdditiveFilterFlagBag<N>);

  return { additives, exclusive };
}

function createDictionary<N extends FilterName>(bag: FlagsBag<N>): FlagDictionary<N> {
  if (isFlagConfiguration<N>(bag)) {
    return {
      additives: createFilterDictionaryFrom(bag.additives),
      exclusives: createFilterDictionaryFrom(bag.exclusives),
    };
  }

  if (hasAdditive<N>(bag)) {
    return { additives: createFilterDictionaryFrom(bag.additives) };
  }

  if (hasExclusive<N>(bag)) {
    return { exclusives: createFilterDictionaryFrom(bag.exclusives) };
  }

  return {
    additives: createFilterDictionaryFrom(bag),
  };
}

export default FlagsSelect;
