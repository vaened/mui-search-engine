import { useEffect, useReducer } from "react";

export type UseFormStatusProps = {
  isHydrating: boolean;
  manualStart?: boolean;
};

export type ActionType = Action["type"];

type State = {
  /**
   * Consolidated visual loading state.
   * Aggregates hydration and search loading statuses into a single boolean
   * to ensure visual consistency and prevent UI flickering.
   */
  isLoading: boolean;

  /**
   * Safety latch for the initial load sequence.
   * Ensures the hydration spinner is disabled only once.
   *
   * Prevents race conditions where a re-render could accidentally disable
   * the spinner while a manual search triggered by the user is in progress.
   */
  hasLatched: boolean;
};

type Action = { type: "SYNC"; isHydrating: boolean; manualStart?: boolean } | { type: "START_SEARCH" } | { type: "END_SEARCH" };

/**
 * State Machine managing the Loading Spinner visibility.
 *
 * Addresses two specific UX challenges:
 * 1. Flicker: Bridges the temporal gap between URL hydration completion and
 * auto-search initiation.
 * 2. Race Condition: Prevents hydration updates from interrupting an active
 * manual search.
 */
function statusReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SYNC": {
      // 1. ABSOLUTE PRIORITY: Hydration active.
      if (action.isHydrating) {
        return { ...state, isLoading: true };
      }

      // 2. LATCH LOGIC (Manual Search protection):
      // Stops loading only if hydration finished AND manual mode is active,
      // but strictly guards against overriding an active user search state
      // (indicated by hasLatched being true).
      if (action.manualStart && state.isLoading && !state.hasLatched) {
        return { isLoading: false, hasLatched: true };
      }

      // 3. BRIDGE (Anti-Flicker):
      // In auto-mode, ignores hydration completion to maintain the loading state.
      // This persists the spinner until the 'START_SEARCH' action is dispatched.
      return state;
    }

    case "START_SEARCH":
      return { ...state, isLoading: true };

    case "END_SEARCH":
      return { ...state, isLoading: false };

    default:
      return state;
  }
}

export function useFormStatus({ isHydrating, manualStart }: UseFormStatusProps) {
  const [state, dispatchStatus] = useReducer(statusReducer, {
    isLoading: isHydrating,
    hasLatched: false,
  });

  const isFormLoading = state.isLoading;

  useEffect(() => {
    dispatchStatus({ type: "SYNC", isHydrating, manualStart });
  }, [isHydrating, manualStart]);

  function setLoadingStatus(status: boolean) {
    dispatchStatus({ type: status ? "START_SEARCH" : "END_SEARCH" });
  }

  return {
    isFormLoading,
    setLoadingStatus,
  };
}
