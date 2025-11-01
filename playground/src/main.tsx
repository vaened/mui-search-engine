import { SearchEngineConfigProvider } from "@/config";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SearchEngineConfigProvider locale="es">
    <App />
  </SearchEngineConfigProvider>
);
