import { useSearchBuilder } from "@/context";

export function useSearchEngineIsReady(): boolean {
  const { checkIsReady: checkInitialized } = useSearchBuilder();
  return checkInitialized();
}
