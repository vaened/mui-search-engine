import { useSearchBuilder } from "../contexts";

export function useSearchFormReady(): boolean {
  const { isFormReady } = useSearchBuilder();
  return isFormReady;
}
