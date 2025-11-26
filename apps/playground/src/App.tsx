import {
  Container,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { ActiveFiltersBar, FilterFieldController, OptionSelect, SearchBar, SearchForm, type FlagsKeysOf } from "@vaened/mui-search-builder";
import type { FieldsCollection } from "@vaened/react-search-builder";
import { useSearchEngine } from "@vaened/react-search-builder";
import { useState } from "react";

const theme = createTheme();

type NumberValue = 1 | 2 | 3;

const additives = {
  onlyActives: (
    <>
      oli <b>ga</b>
    </>
  ),
  inDebt: "Con deuda",
  withoutEmail: "Sin email",
};

const additive: keyof typeof additives = "onlyActives";
const numberValue: NumberValue = 1;

const exclusives = {
  exclusives: {
    pending: {
      label: "Pendiente",
      description: "Usuarios pendientes de confirmación.",
    },
    processed: {
      label: "Procesado",
      description: "Usuarios que han sido confirmados.",
    },
  },
};
const indexes = {
  person: {
    label: "Persona",
    description: "Busqueda por número de identificación, y por nombres y apellidos.",
  },
  account: {
    label: "Cuenta",
    description: "Busqueda por número de cuenta, por nombres y apellidos del propietario y por uuid.",
  },
};

const flags = {
  additives: {
    onlyActives: {
      label: "Solo activos",
      description: "Filtrar únicamente usuarios activos.",
    },
    inDebt: {
      label: "Con deuda",
      description: "Usuarios que tienen un deuda pendiente de pago.",
    },
    withoutEmail: {
      label: "Sin email",
      description: "Filtrar a todos los usuarios sin email.",
    },
  },
  exclusives: {
    pending: {
      label: "Pendiente",
      description: "Usuarios pendientes de confirmación.",
    },
    processed: {
      label: "Procesado",
      description: "Usuarios que han sido confirmados.",
    },
  },
};

type CountryId = 1 | 2 | 3;
const countries: { value: CountryId; label: string }[] = [
  { value: 1, label: "Peru" },
  { value: 2, label: "Colombia" },
  { value: 3, label: "Brasil" },
];

interface Params {
  q?: string;
  index?: keyof typeof indexes;
  flags?: FlagsKeysOf<typeof flags>[];
}

export default function App() {
  const store = useSearchEngine({ persistInUrl: true });

  const data: number[] = [];

  function search(collection: FieldsCollection) {
    console.log({ submit: [...collection.toArray()] });
  }

  function onChange(collection: FieldsCollection) {
    console.log({ changed: { ...collection.toValues() } });
  }
  const [personName, setPersonName] = useState<string[]>([]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4">Playground — mui-search-engine</Typography>
        <Grid container gap={2} flexDirection="column">
          <Grid>
            <SearchForm store={store} onSearch={search} onChange={onChange} loading={false}>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="countries" shrink>
                    Paises
                  </InputLabel>
                  <OptionSelect
                    type="number"
                    name="countries"
                    labelId="countries"
                    label="Paises"
                    items={countries}
                    getValue={(country) => country.value}
                    getLabel={(country) => country.label}
                    toHumanLabel={(v) => countries.find((country) => country.value === v)?.label ?? v.toString()}
                    submittable
                    displayEmpty
                  />
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="additives" shrink>
                    Aditivos
                  </InputLabel>
                  <OptionSelect
                    type="string[]"
                    name="additives"
                    labelId="additives"
                    defaultValue={[]}
                    label="Aditivos"
                    toHumanLabel={(value) => additives[value as keyof typeof additives] as string}
                    submittable
                    displayEmpty>
                    <MenuItem value="" disabled>
                      Todos
                    </MenuItem>
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="centers" shrink>
                    Sedesf
                  </InputLabel>
                  <OptionSelect
                    type="string"
                    name="centers"
                    labelId="centers"
                    label="Sedesd"
                    defaultValue={""}
                    toHumanLabel={(v) => v}
                    displayEmpty>
                    <MenuItem value="" disabled>
                      Todos
                    </MenuItem>
                    <MenuItem value="San Juan de Lurigancho">San Juan de Lurigancho</MenuItem>
                    <MenuItem value="Independencia">Independencia</MenuItem>
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FilterFieldController
                  store={store}
                  type="string[]"
                  name="classroom"
                  submittable
                  defaultValue={[]}
                  serializer={{
                    serialize: (c) => c,
                    unserialize: (c) => c,
                  }}
                  humanize={(value) => value.map((value) => ({ value: value, label: value.toString() }))}
                  control={(props) => (
                    <FormControl fullWidth>
                      <InputLabel id="centersd" shrink>
                        Salonesd
                      </InputLabel>
                      <Select name="classroom" labelId="classroom" label="Salones" {...props} multiple displayEmpty>
                        <MenuItem value="" disabled>
                          Todos
                        </MenuItem>
                        <MenuItem value="sjl1">SJL-1</MenuItem>
                        <MenuItem value="sjl2">JSL-2</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <SearchBar name={{ query: "q" }} size="medium" indexes={indexes} flags={flags} defaultIndex={"account"} />
              </Grid>
              <Grid size={12}>
                <ActiveFiltersBar limitTags={4} />
              </Grid>
            </SearchForm>
          </Grid>
          <Grid size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Namde</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(indexes).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value.label}</TableCell>
                      <TableCell>{value.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

function MultipleSelectCheckmarks() {
  return <div></div>;
}
