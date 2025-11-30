import { useSearchBuilder } from "../context";

export function useSearchReady(): boolean {
  const { isFormReady } = useSearchBuilder();
  return isFormReady;
}
