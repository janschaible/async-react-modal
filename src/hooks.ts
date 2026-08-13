import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import {
  EMPTY_ENTRIES,
  dismissAllEntries,
  getEntries,
  settleEntry,
  subscribe,
  type ModalEntry,
} from "./store";

let mountedHosts = 0;

export function assertModalHostMounted(): void {
  if (mountedHosts === 0) {
    throw new Error(
      "[async-react-modal] AsyncModal.show() was called without a mounted <AsyncModal.Host />.",
    );
  }
}

export function useModalEntries(): ModalEntry[] {
  return useSyncExternalStore(subscribe, getEntries, () => EMPTY_ENTRIES);
}

export function useHostRegistration(): void {
  useLayoutEffect(() => {
    if (mountedHosts > 0) {
      throw new Error(
        "[async-react-modal] Only one <AsyncModal.Host /> can be mounted at a time.",
      );
    }

    mountedHosts = 1;

    return () => {
      mountedHosts = 0;
      dismissAllEntries();
    };
  }, []);
}

export function useEscapeDismissal(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;

      const activeEntry = getEntries()[0];
      if (!activeEntry) return;

      settleEntry(activeEntry.id, (entry) => entry.resolve(undefined));
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
