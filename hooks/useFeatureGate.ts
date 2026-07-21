"use client";

import { useState, useCallback } from "react";
import { FeatureKey, isFeatureAllowed, getPlanDefinition } from "@/lib/plans/feature-matrix";

export function useFeatureGate(currentPlanSlug?: string | null) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    requestedFeature: FeatureKey | null;
  }>({
    isOpen: false,
    requestedFeature: null,
  });

  const activePlanSlug = currentPlanSlug || "starter";
  const activePlan = getPlanDefinition(activePlanSlug);

  const checkFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return isFeatureAllowed(activePlanSlug, feature);
    },
    [activePlanSlug]
  );

  const requestFeature = useCallback(
    (feature: FeatureKey, callbackOnAllowed?: () => void) => {
      const allowed = isFeatureAllowed(activePlanSlug, feature);
      if (allowed) {
        if (callbackOnAllowed) callbackOnAllowed();
        return true;
      }
      setModalState({
        isOpen: true,
        requestedFeature: feature,
      });
      return false;
    },
    [activePlanSlug]
  );

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, requestedFeature: null });
  }, []);

  return {
    activePlan,
    checkFeature,
    requestFeature,
    isOpen: modalState.isOpen,
    requestedFeature: modalState.requestedFeature,
    closeModal,
  };
}
