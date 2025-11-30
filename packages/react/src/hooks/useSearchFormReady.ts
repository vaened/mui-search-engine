import { useSearchBuilder } from "../context";

export function useSearchFormReady(): boolean {
  const { isFormReady } = useSearchBuilder();
  return isFormReady;
}
