import ActiveFiltersBar from "@/components/ActiveFiltersBar";
import FilterFieldController from "@/components/FilterFieldController";
import OptionSelect from "@/components/OptionSelect";
import SearchBar, { type FlagsKeysOf } from "@/components/SearchBar";
import SearchBuilder from "@/components/SearchBuilder";
import type { FieldsCollection } from "@/context/FieldsCollection";
import { FieldStore } from "@/context/FieldStore";
import { UrlPersistenceAdapter } from "@/persistence/UrlPersistenceAdapter";
import type { SearchParams } from "@/types";
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
  createTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "node_modules/@mui/material";
import { useRef } from "react";

const theme = createTheme();

const additives = {
  onlyActives: "Solo activos",
  inDebt: {
    label: "Con deuda",
  },
  withoutEmail: {
    label: "Sin email",
  },
};

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

const countries = [
  { value: "PER", label: "Peru" },
  { value: "COL", label: "Colombia" },
  { value: "BRA", label: "Brasil" },
];

interface Params extends SearchParams {
  q?: string;
  index?: keyof typeof indexes;
  flags?: FlagsKeysOf<typeof flags>[];
}

function useSingleton<T>(state: () => T): T {
  const instance = useRef<T | null>();

  if (!instance.current) {
    instance.current = state();
  }

  return instance.current;
}

export default function App() {
  const store = useSingleton(() => new FieldStore(new UrlPersistenceAdapter()));

  function search(collection: FieldsCollection) {
    console.log({ submit: [...collection.toArray()] });
  }

  function onChange(collection: FieldsCollection) {
    console.log({ changed: { ...collection.toValues() } });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        <h1>Playground — mui-search-engine</h1>

        <Grid container gap={2} flexDirection="column">
          <Grid>
            <SearchBuilder store={store} onSearch={search} onChange={onChange} loading={false}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="country">Pais</InputLabel>
                  <OptionSelect<typeof countries, string[]>
                    name="country"
                    labelId="country"
                    defaultValue={[]}
                    serialize={(a) => a.map((a) => a?.value as string)}
                    unserialize={(a) => a.map((a) => countries.find((c) => c.value === a) as (typeof countries)[number])}
                    humanize={(centers) => centers.map((center) => ({ value: center, label: center.label }))}
                    label="Pais"
                    submittable
                    multiple>
                    <MenuItem value="" disabled>
                      Todos
                    </MenuItem>
                    {countries.map((country, index) => (
                      <MenuItem key={`country-${index}`} value={country as any}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="centers" shrink>
                    Sedes
                  </InputLabel>
                  <OptionSelect name="centers" labelId="centers" defaultValue="" label="Sedes" humanize={(values) => values} displayEmpty>
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
                  name="classroom"
                  submittable
                  humanize={(value) => value as string}
                  control={({ value, set }) => (
                    <FormControl fullWidth>
                      <InputLabel id="centers" shrink>
                        Sedes
                      </InputLabel>
                      <Select
                        name="classroom"
                        labelId="classroom"
                        value={value ?? ""}
                        onChange={(event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
                          set(event.target.value as "");
                        }}
                        label="Salones"
                        displayEmpty>
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
                <ActiveFiltersBar />
              </Grid>
            </SearchBuilder>
          </Grid>
          <Grid size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
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
