import type { ComponentType } from "react";

export type ModalEntry = {
  id: number;
  component: ComponentType<any>;
  props: object;
  resolve(value: unknown): void;
  reject(reason?: unknown): void;
  previouslyFocusedElement?: HTMLElement;
};

export const EMPTY_ENTRIES: ModalEntry[] = [];

let nextId = 0;
let entries: ModalEntry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getEntries(): ModalEntry[] {
  return entries;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addEntry(entry: Omit<ModalEntry, "id">): void {
  entries = [...entries, { ...entry, id: ++nextId }];
  emit();
}

export function settleEntry(
  id: number,
  action: (entry: ModalEntry) => void,
): void {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) return;

  entries = entries.filter((candidate) => candidate.id !== id);
  emit();
  action(entry);
  entry.previouslyFocusedElement?.focus();
}

export function dismissAllEntries(): void {
  const pendingEntries = entries;
  entries = [];
  emit();

  pendingEntries.forEach((entry) => {
    entry.resolve(undefined);
    entry.previouslyFocusedElement?.focus();
  });
}
