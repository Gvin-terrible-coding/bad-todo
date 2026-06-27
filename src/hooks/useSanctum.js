import { useState, useCallback } from 'react';

/**
 * Manages Sanctum editor visibility lifecycle.
 */
export function useSanctum() {
  const [isSanctumEditMode, setIsSanctumEditMode] = useState(false);

  const enterSanctumEditMode = useCallback(() => setIsSanctumEditMode(true), []);
  const exitSanctumEditMode = useCallback(() => setIsSanctumEditMode(false), []);

  return {
    isSanctumEditMode,
    enterSanctumEditMode,
    exitSanctumEditMode,
    setSanctumEditMode: setIsSanctumEditMode,
  };
}
