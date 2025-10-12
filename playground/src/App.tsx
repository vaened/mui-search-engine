import { Container, CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        <h1>Playground — mui-search-engine</h1>
      </Container>
    </ThemeProvider>
  );
}
