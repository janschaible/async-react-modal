import {
  memo,
  useMemo,
  type ComponentType,
  type MouseEvent,
  type ReactElement,
} from "react";
import {
  assertModalHostMounted,
  useEscapeDismissal,
  useHostRegistration,
  useModalEntries,
} from "./hooks";
import { addEntry, settleEntry } from "./store";
import type {
  AsyncModalBackdropProps,
  AsyncModalHostProps,
  CallerModalProps,
  ModalInput,
  ModalOutput,
  ModalProps,
} from "./types";

type ModalRendererProps = {
  backdrop: ComponentType<AsyncModalBackdropProps>;
  entry: ReturnType<typeof useModalEntries>[number];
};

const ModalRenderer = memo(function ModalRenderer({
  backdrop: Backdrop,
  entry,
}: ModalRendererProps): ReactElement {
  const controls = useMemo<ModalProps<object, unknown>>(
    () => ({
      resolve: (value) =>
        settleEntry(entry.id, (current) => current.resolve(value)),
      reject: (reason) =>
        settleEntry(entry.id, (current) => current.reject(reason)),
      dismiss: () =>
        settleEntry(entry.id, (current) => current.resolve(undefined)),
    }),
    [entry.id],
  );
  const Component = entry.component;

  return (
    <Backdrop dismiss={controls.dismiss}>
      <Component {...entry.props} {...controls} />
    </Backdrop>
  );
});

function DefaultBackdrop({
  children,
  dismiss,
}: AsyncModalBackdropProps): ReactElement {
  function handleMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) dismiss();
  }

  return (
    <div
      data-async-react-modal-backdrop=""
      onMouseDown={handleMouseDown}
      role="presentation"
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

function show<Component extends ComponentType<any>>(
  component: Component,
  props: CallerModalProps<ModalInput<Component>>,
): Promise<ModalOutput<Component> | undefined> {
  assertModalHostMounted();

  return new Promise<ModalOutput<Component> | undefined>((resolve, reject) => {
    addEntry({
      component,
      props,
      resolve: resolve as (value: unknown) => void,
      reject,
      previouslyFocusedElement:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined,
    });
  });
}

function Host({
  backdrop: Backdrop = DefaultBackdrop,
  dismissOnEscape = true,
}: AsyncModalHostProps) {
  const snapshot = useModalEntries();
  useHostRegistration();
  useEscapeDismissal(dismissOnEscape);

  const entry = snapshot[0];

  if (!entry) {
    return <div data-async-react-modal-host="" />;
  }

  return (
    <div data-async-react-modal-host="">
      <ModalRenderer key={entry.id} backdrop={Backdrop} entry={entry} />
    </div>
  );
}

export const AsyncModal = { show, Host };
export { DefaultBackdrop };
export type {
  AsyncModalBackdropProps,
  AsyncModalComponent,
  AsyncModalHostProps,
  ModalProps,
} from "./types";
