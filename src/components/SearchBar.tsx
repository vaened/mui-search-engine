/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import FlagsSelect, { type FlagsBag } from "@/components/FlagsSelect";
import IndexSelect from "@/components/IndexSelect";
import { useSearchEngine } from "@/context";
import { useSearchEngineField } from "@/hooks/useSearchEngineField";
import type { FilterBag, FilterName, InputSize } from "@/types";
import { createFilterDictionaryFrom } from "@/utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import MuiPaper, { type PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const HEIGHT = { small: 40, medium: 56 } as const;
const INPUT_PY = { small: 8.5, medium: 16.5 } as const;

type KeysOf<T> = T extends Record<infer K extends FilterName, unknown> ? K : never;
type FromAdditives<T> = T extends { additives?: Record<infer U extends FilterName, unknown> } ? U : never;
type FromExclusives<T> = T extends { exclusives?: Record<infer U extends FilterName, unknown> } ? U : never;
export type FlagsKeysOf<T> = FromAdditives<T> | FromExclusives<T> | KeysOf<T>;
export type SearchBarName = { query?: string; index?: string; flags?: string };

interface SearchBarProps<IB extends FilterBag<FilterName>, FB extends FlagsBag<FilterName>> {
  id?: string;
  label?: string;
  size?: InputSize;
  placeholder?: string;
  indexes?: IB;
  flags?: FB;
  name?: SearchBarName;
  debounceDelay?: number;
  defaultIndex?: KeysOf<IB>;
  defaultFlags?: FlagsKeysOf<FB>[];
  defaultValue?: string;
  onChange?: (params: string) => void;
}

type PanelProps = PaperProps & { size: InputSize };

const Container = styled(Box)<{ size: InputSize }>(() => ({
  position: "relative",
}));

const Panel = styled(MuiPaper, {
  shouldForwardProp: (p) => p !== "size",
})<PanelProps>(({ theme, size }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",

  minHeight: HEIGHT[size],
  padding: "0 9px",

  borderRadius: theme.shape.borderRadius,
  outline: "none",
  overflow: "visible",

  "& .outline": {
    pointerEvents: "none",
    position: "absolute",
    top: -5,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: "0 8px",
    borderRadius: "inherit",
    border: "1px solid rgba(0,0,0,0.23)",
    zIndex: 0,
  },
  "&:hover .outline": { borderColor: "rgba(0,0,0,0.87)" },
  "&:focus-within .outline": { borderColor: "#1976d2", borderWidth: 2 },

  "& .outline-label": {
    float: "unset",
    width: "auto",
    height: 11,
    padding: 0,
    maxWidth: "100%",
    overflow: "hidden",
  },

  "& .outline-label > span": {
    display: "inline-block",
    paddingRight: "5px",
    paddingLeft: "5px",
    fontSize: ".75rem",
    visibility: "hidden",
  },

  "& .content": {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  "& .MuiInputBase-input": {
    paddingTop: INPUT_PY[size],
    paddingBottom: INPUT_PY[size],
  },
}));

const FloatingLabel = styled(InputLabel)<{ size: "small" | "medium" }>(({ size }) => ({
  position: "absolute",
  transform: "translate(14px, -9px) scale(0.75)",
  left: 0,
  top: size === "small" ? 0 : 0,
  zIndex: 100,
}));

export function SearchBar<IB extends FilterBag<FilterName>, FB extends FlagsBag<FilterName>>({
  id,
  label = "Search for matches by",
  size = "medium",
  indexes,
  flags,
  name,
  debounceDelay = 400,
  placeholder,
  defaultIndex,
  defaultFlags,
  defaultValue,
  onChange,
}: SearchBarProps<IB, FB>) {
  const inputId = id || useId();
  const inputSearch = useRef<HTMLInputElement>(undefined);
  const dictionary = useMemo(() => createFilterDictionaryFrom<KeysOf<IB>>(indexes), [indexes]);
  const [index, setIndex] = useState<KeysOf<IB> | undefined>(() => {
    return dictionary && !defaultIndex ? (Object.keys(dictionary)[0] as KeysOf<IB>) : defaultIndex;
  });

  const { isLoading } = useSearchEngine();
  const { value, set } = useSearchEngineField({
    name: name?.query || "q",
    defaultValue: defaultValue || null,
    humanize: (v) => v,
    serialize: (v) => v,
    unserialize: (v) => v,
  });

  const [queryString, setQueryString] = useState(value);
  const debouncedTerm = useDebounce(queryString || "", debounceDelay);

  const description = dictionary && index ? dictionary[index].description : null;

  useEffect(() => {
    setQueryString(value);
  }, [value]);

  useEffect(() => {
    if (queryString === value) {
      return;
    }

    set(debouncedTerm);
    onChange?.(debouncedTerm);
  }, [debouncedTerm]);

  function onQueryStringChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQueryString(event.target.value);
  }

  function onIndexChange(string: KeysOf<IB> | undefined) {
    setIndex(string);
    setTimeout(() => inputSearch.current?.focus(), 100);
  }

  return (
    <>
      <Container size={size}>
        <FloatingLabel size={size} htmlFor={inputId}>
          {label}
        </FloatingLabel>

        <Panel elevation={0} size={size}>
          <fieldset className="outline" aria-hidden>
            <legend className="outline-label">
              <span>{label}</span>
            </legend>
          </fieldset>

          <Box className="content">
            {dictionary && index && (
              <IndexSelect name={name?.index} size={size} options={dictionary} defaultValue={index} onChange={onIndexChange} />
            )}

            <InputBase
              id={inputId}
              inputRef={inputSearch}
              fullWidth
              disabled={isLoading}
              sx={{ ml: 1, flex: 1 }}
              placeholder={placeholder}
              inputProps={{ "aria-label": label }}
              value={queryString ?? ""}
              onChange={onQueryStringChange}
            />

            <Button loading={isLoading} size={size} type="submit" aria-label="search" sx={{ minWidth: "34px" }}>
              <IconSearch />
            </Button>

            {flags && (
              <>
                <Divider sx={{ height: HEIGHT[size] - 25, m: 0.5 }} orientation="vertical" />
                <FlagsSelect name={name?.flags} size={size} options={flags} defaultValue={defaultFlags} />
              </>
            )}
          </Box>
        </Panel>
      </Container>
      {index && description && (
        <Typography component="p" textAlign="right" color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </>
  );
}

function useDebounce(queryString: string, delay: number) {
  const [debounced, setValue] = useState(queryString);

  useEffect(() => {
    const handler = setTimeout(() => {
      setValue(queryString);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [queryString, delay]);

  return debounced;
}

export default SearchBar;
