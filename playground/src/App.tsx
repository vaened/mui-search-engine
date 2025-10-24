import OptionSelect from "@/components/OptionSelect";
import SearchBar, { type FlagsKeysOf } from "@/components/SearchBar";
import SearchBuilder from "@/components/SearchBuilder";
import type { SearchParams } from "@/types";
import { Container, CssBaseline, FormControl, Grid, InputLabel, MenuItem, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

const additives = {
  onlyActives: "Solo activos",
  inDebt: {
    label: "Con deuda",
    description: "Usuarios que tienen un deuda pendiente de pago.",
  },
  withoutEmail: {
    label: "Sin email",
    description: "Filtrar a todos los usuarios sin email.",
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

export default function App() {
  function search(params: Params) {
    console.log({ submit: { ...params } });
  }

  function onChange(params: Params) {
    console.log({ changed: { ...params } });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        <h1>Playground — mui-search-engine</h1>

        <Grid container gap={2} flexDirection="column">
          <Grid>
            <SearchBuilder onSearch={search} onChange={onChange} loading={false} persistence="url">
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="country">Sedes</InputLabel>
                  <OptionSelect
                    name="country"
                    labelId="country"
                    defaultValue={countries[0]}
                    label="Sedes"
                    unserialize={(a) => countries.find((c) => c.value === a) ?? null}
                    serialize={(a) => a?.value as string}>
                    <MenuItem value="" disabled>
                      Todos
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem value={country as any}>{country.label}</MenuItem>
                    ))}
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="centers">Sedes</InputLabel>
                  <OptionSelect name="centers" labelId="centers" defaultValue={[]} label="Sedes" multiple>
                    <MenuItem value="" disabled>
                      Todos
                    </MenuItem>
                    <MenuItem value="person">San Juan de Lurigancho</MenuItem>
                    <MenuItem value="account">Independencia</MenuItem>
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="classroom">Salones</InputLabel>
                  <OptionSelect name="classroom" labelId="classroom" defaultValue="sjl2" label="Salones">
                    <MenuItem value="sjl1">SJL-1</MenuItem>
                    <MenuItem value="sjl2">JSL-2</MenuItem>
                  </OptionSelect>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <SearchBar
                  label="Buscar coincidencias por"
                  name={{ query: "q" }}
                  indexes={indexes}
                  flags={flags}
                  defaultIndex={"account"}
                />
              </Grid>
            </SearchBuilder>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
