/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useMemo } from "react";
import type { FilterValue } from "../field";

export type Type =
  | "undefined"
  | "null"
  | "date"
  | "object"
  | "string"
  | "number"
  | "boolean"
  | "null[]"
  | "date[]"
  | "object[]"
  | "string[]"
  | "number[]"
  | "boolean[]";

type useSerializationProps = {
  value: FilterValue;
};

export function useSerialization({ value }: useSerializationProps) {
  return useMemo((): Type => {
    if (!Array.isArray(value)) {
      return infer(value);
    }

    const elementType = value.length > 0 ? infer(value[0]) : "undefined";
    return `${elementType}[]` as Type;
  }, [value]);
}

function infer(value: FilterValue): Exclude<Type, `${string}[]`> {
  if (value === null) {
    return "null";
  }

  if (value instanceof Date) {
    return "date";
  }

  const type = typeof value;
  switch (type) {
    case "string":
    case "number":
    case "boolean":
    case "object":
      return type;
    case "undefined":
      return "undefined";
    default:
      return "undefined";
  }
}
