/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchEngineField } from "@/hooks/useSearchEngineField";
import type { FilterBag, FilterName, InputSize } from "@/types";
import { createFilterDictionaryFrom, dictionaryToFilterElements } from "@/utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { IconChevronDown, IconPrompt } from "@tabler/icons-react";
import React, { useMemo, useState, type ReactNode } from "react";

interface IndexSelectProps<N extends FilterName> {
  name?: FilterName;
  size?: InputSize;
  options: FilterBag<N>;
  tooltip?: string;
  mobileIcon?: ReactNode;
  defaultValue: N;
  uncaret?: boolean;
  onChange: (index: N | undefined) => void;
}

export function IndexSelect<N extends FilterName>({
  name = "index",
  size = "medium",
  options,
  defaultValue,
  mobileIcon,
  tooltip,
  uncaret,
  onChange,
}: IndexSelectProps<N>) {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const dictionary = useMemo(() => createFilterDictionaryFrom(options), [options]);
  const elements = useMemo(() => dictionaryToFilterElements(dictionary), [dictionary]);

  const [open, setMenuOpenStatus] = useState(false);
  const { value, set } = useSearchEngineField({
    name,
    defaultValue,
    serialize: (index) => index,
    unserialize: (index) => index,
  });

  const current = useMemo(() => (value ? dictionary[value] : null), [value]);

  const openMenu = () => setMenuOpenStatus(true);
  const closeMenu = () => setMenuOpenStatus(false);

  function onIndexChange(index: N) {
    set(index);
    onChange(index);
    closeMenu();
  }

  return (
    <>
      <Box ref={anchorRef} sx={{ display: "inline-flex" }}>
        <Tooltip title={tooltip ?? "Search by"}>
          <Button
            onClick={openMenu}
            size={size}
            variant="text"
            endIcon={uncaret ? undefined : <IconChevronDown size={16} />}
            sx={{ display: { xs: "none", sm: "inline-flex" }, lineHeight: 1.7, "& .MuiButton-icon": { marginLeft: "4px" } }}
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true">
            {current?.label ?? "Select Index"}
          </Button>
        </Tooltip>

        <Tooltip title={current?.label ?? "Search by"} sx={{ display: { xs: "inline-flex", sm: "none" } }}>
          <IconButton
            onClick={openMenu}
            size={size}
            sx={{ display: { xs: "inline-flex", sm: "none" }, p: "6px" }}
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true">
            {mobileIcon ?? <IconPrompt />}
          </IconButton>
        </Tooltip>
      </Box>

      <Menu onClose={closeMenu} open={open} anchorEl={anchorRef.current} aria-labelledby="composition-button">
        <ListSubheader>Index</ListSubheader>
        {elements.map((element, index) => (
          <MenuItem key={`${index}-${element.value}`} value={element.value} onClick={() => onIndexChange(element.value)}>
            {element.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default IndexSelect;
