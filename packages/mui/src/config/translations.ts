/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import type { TranslationDictionary } from "@vaened/react-search-builder";

export default {
  en: {
    global: {
      filtersLabel: "Filters",
    },
    searchBar: {
      defaultLabel: "Search for matches by",
      searchAriaLabel: "search",
    },
    indexSelect: {
      tooltip: "Search by",
      defaultLabel: "Select Index",
      dropdownTitle: "Index",
    },
    flagsSelect: {
      tooltip: "Select Filters",
      dropdownTitle: "Available Flags",
      restartButton: "Restart",
    },
    activeFiltersBar: {
      title: "Applied Filters",
      noFilters: "No filters have been applied yet.",
      clearAllTooltip: "Clear all filters",
      clearAllAriaLabel: "delete",
    },
  },
  es: {
    global: {
      filtersLabel: "Filtros",
    },
    searchBar: {
      defaultLabel: "Buscar coincidencias por",
      searchAriaLabel: "buscar",
    },
    indexSelect: {
      tooltip: "Buscar por",
      defaultLabel: "Seleccionar Índice",
      dropdownTitle: "Índice",
    },
    flagsSelect: {
      tooltip: "Indicadores",
      dropdownTitle: "Indicadores Disponibles",
      restartButton: "Reiniciar",
    },
    activeFiltersBar: {
      title: "Filtros Aplicados",
      noFilters: "No se han aplicado filtros aún.",
      clearAllTooltip: "Borrar todos los filtros",
      clearAllAriaLabel: "borrar",
    },
  },
} satisfies TranslationDictionary;
