/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import Grid, { GridProps } from "@mui/material/Grid";
import type { SearchBuilderProviderProps } from "@vaened/react-search-builder";
import { SearchBuilderProvider } from "@vaened/react-search-builder";

export type SearchFormProps = Omit<SearchBuilderProviderProps, "Container"> &
  Omit<GridProps, "container" | "component" | "onSubmit" | "onChange">;

function MuiForm(props: GridProps) {
  return <Grid component="form" spacing={2} container {...props} />;
}

export function SearchForm({
  store,
  loading,
  manualStart,
  autoStartDelay,
  submitOnChange,
  children,
  onSearch,
  onChange,
  ...restOfProps
}: SearchFormProps) {
  return (
    <SearchBuilderProvider
      store={store}
      loading={loading}
      manualStart={manualStart}
      autoStartDelay={autoStartDelay}
      submitOnChange={submitOnChange}
      onSearch={onSearch}
      onChange={onChange}
      Container={<MuiForm {...restOfProps} />}>
      {children}
    </SearchBuilderProvider>
  );
}

export default SearchForm;
