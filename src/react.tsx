import {
  useSyncExternalStore,
  type ComponentType,
  type MouseEvent,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { ModalDismissedError, type ModalProps } from "./index";

type AnyProps = object;
const EMPTY_ENTRIES: Entry[] = [];

type Entry = {
  id: number;
  component: ComponentType<any>;
  props: AnyProps;
  resolve(value: unknown): void;
  reject(reason?: unknown): void;
};

let nextId = 0;
let entries: Entry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function remove(id: number): Entry | undefined {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) return undefined;

  entries = entries.filter((candidate) => candidate.id !== id);
  emit();
  return entry;
}

function settle(id: number, action: (entry: Entry) => void): void {
  const entry = remove(id);
  if (entry) action(entry);
}

export type AsyncModalComponent<Input extends object, Output> = ComponentType<
  ModalProps<Input, Output>
>;

export type AsyncModalBackdropProps = PropsWithChildren<{
  dismiss(): void;
}>;

export type AsyncModalHostProps = {
  backdrop?: ComponentType<AsyncModalBackdropProps>;
};

function DefaultBackdrop({
  children,
  dismiss,
}: AsyncModalBackdropProps): ReactElement {
  function handleMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) dismiss();
  }

  return (
    <div
      data-async-modal-backdrop=""
      onMouseDown={handleMouseDown}
      style={{
        alignItems: "center",
        background: "rgb(0 0 0 / 50%)",
        display: "flex",
        inset: 0,
        justifyContent: "center",
        padding: "1rem",
        position: "fixed",
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}

function show<Props extends AnyProps, Result>(
  component: AsyncModalComponent<Props, Result>,
  props: Props,
): Promise<Result> {
  return new Promise<Result>((resolve, reject) => {
    entries = [
      ...entries,
      {
        id: ++nextId,
        component,
        props: props as Record<string, unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      },
    ];
    emit();
  });
}

function Host({ backdrop: Backdrop = DefaultBackdrop }: AsyncModalHostProps) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => entries,
    () => EMPTY_ENTRIES,
  );

  return (
    <div data-async-modal-host="">
      {snapshot.map((entry) => {
        const Component = entry.component;
        const controls: ModalProps<object, unknown> = {
          resolve: (value) =>
            settle(entry.id, (current) => current.resolve(value)),
          reject: (reason) =>
            settle(entry.id, (current) => current.reject(reason)),
          dismiss: () =>
            settle(entry.id, (current) =>
              current.reject(new ModalDismissedError()),
            ),
        };

        return (
          <Backdrop key={entry.id} dismiss={controls.dismiss}>
            <Component {...entry.props} {...controls} />
          </Backdrop>
        );
      })}
    </div>
  );
}

export const AsyncModal = { show, Host };
export { DefaultBackdrop };
export { ModalDismissedError, type ModalProps } from "./index";
