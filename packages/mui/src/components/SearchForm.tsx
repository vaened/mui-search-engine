/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import Grid, { GridProps } from "@mui/material/Grid";
import type { SearchFormProps as NativeSearchFormProps } from "@vaened/react-search-builder";
import { SearchForm as NativeSearchForm } from "@vaened/react-search-builder";

export type SearchFormProps = Omit<NativeSearchFormProps, "Container"> &
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
  configuration,
  onSearch,
  onChange,
  ...restOfProps
}: SearchFormProps) {
  return (
    <NativeSearchForm
      store={store}
      loading={loading}
      manualStart={manualStart}
      autoStartDelay={autoStartDelay}
      submitOnChange={submitOnChange}
      configuration={configuration}
      onSearch={onSearch}
      onChange={onChange}
      Container={<MuiForm {...restOfProps} />}>
      {children}
    </NativeSearchForm>
  );
}

export default SearchForm;
