import { MuiSearchBuilderConfigProvider } from "@vaened/mui-search-builder";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MuiSearchBuilderConfigProvider locale="es">
    <App />
  </MuiSearchBuilderConfigProvider>
);
