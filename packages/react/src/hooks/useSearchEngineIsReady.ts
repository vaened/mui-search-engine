/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useSearchBuilder } from "../context";

export function useSearchEngineIsReady(): boolean {
  const { checkIsReady: checkInitialized } = useSearchBuilder();
  return checkInitialized();
}
