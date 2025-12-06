/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { useCallback, useState } from "react";
import { FieldOperation, FieldsCollection, FieldStore, FieldStoreState } from "../store";

export type SubmitResult = void | boolean;
export type Submit = (params: FieldsCollection) => SubmitResult | Promise<SubmitResult>;

export const SKIP_PERSISTENCE = false;

export type UseFormSubmitProps = {
  store: FieldStore;
  onSearch?: Submit;
  submitOnChange: boolean;
};

const forcedOperations: FieldOperation[] = ["reset", "flush"];

export function useFormSubmit({ store, submitOnChange, onSearch }: UseFormSubmitProps) {
  const [isAutoLoading, setAutoLoadingStatus] = useState(false);

  const dispatch = useCallback(
    function (persist: boolean = true) {
      store.whenReady("search-form", () => {
        const response = Promise.resolve(onSearch?.(store.collection()));

        setAutoLoadingStatus(true);

        response
          .then((result) => {
            if (result === false || !persist) {
              return;
            }

            store.persist();
          })
          .finally(() => setTimeout(() => setAutoLoadingStatus(false), 500));
      });
    },
    [store]
  );

  const resolution = useCallback(
    ({ collection, touched, operation }: FieldStoreState) => {
      const isForcedOperation = forcedOperations.includes(operation);
      const isSetOperation = operation === "set";

      const isSubmittableField = isSetOperation && touched.some((name) => collection.get(name)?.submittable);

      const canBeSubmitted = submitOnChange || isForcedOperation || isSubmittableField;

      if (!canBeSubmitted) {
        return;
      }

      dispatch();
    },
    [submitOnChange, dispatch]
  );

  return {
    isAutoLoading,
    dispatch,
    resolution,
  };
}
