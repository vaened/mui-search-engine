import type { FilterBag, FilterContext, FilterDictionary, FilterElement, FilterLabel, FilterMetaData, FilterName } from "@/types";

export function isFilterContextLabel(x: FilterContext): x is FilterLabel {
  return typeof x === "string";
}

export function isFilterContextElement(x: unknown): x is FilterMetaData {
  return typeof x === "object" && !!x && "label" in x;
}

export function isFilterElement<N extends FilterName>(x: unknown): x is FilterElement<N> {
  return typeof x === "object" && !!x && "label" in x && "value" in x;
}

export function createFilterDictionaryFrom<N extends FilterName>(bag: FilterBag<N>): FilterDictionary<N>;
export function createFilterDictionaryFrom<N extends FilterName>(bag: undefined): undefined;
export function createFilterDictionaryFrom<N extends FilterName>(bag: FilterBag<N> | undefined): FilterDictionary<N> | undefined;
export function createFilterDictionaryFrom<N extends FilterName>(bag: FilterBag<N> | undefined): FilterDictionary<N> | undefined {
  if (!bag) {
    return undefined;
  }

  return Object.entries<FilterContext>(bag).reduce((acc, [key, context]) => {
    switch (true) {
      case isFilterElement<N>(context):
        acc[key as N] = context;
        break;
      case isFilterContextLabel(context):
        acc[key as N] = {
          value: key as N,
          label: context,
        };
        break;
      case isFilterContextElement(context):
        acc[key as N] = {
          value: key as N,
          ...context,
        };
        break;
      default:
        throw new Error(`Invalid filter context: ${context}`);
    }

    return acc;
  }, {} as FilterDictionary<N>);
}

export function dictionaryToFilterElements<N extends FilterName>(dictionary: FilterDictionary<N>): FilterElement<N>[] {
  return Object.entries<FilterElement<N>>(dictionary).map(([, value]) => value);
}
