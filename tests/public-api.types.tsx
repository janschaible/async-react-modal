import type { ReactElement } from "react";
import { expectTypeOf } from "vitest";
import {
  AsyncModal,
  type AsyncModalBackdropProps,
  type ModalProps,
} from "../src/react";

type ChoiceProps = {
  question: string;
};

function ChoiceModal(_props: ModalProps<ChoiceProps, "yes" | "no">) {
  return null;
}

const result = AsyncModal.show(ChoiceModal, { question: "Continue?" });
expectTypeOf(result).toEqualTypeOf<Promise<"yes" | "no" | undefined>>();

// @ts-expect-error The injected controls are not caller-owned props.
AsyncModal.show(ChoiceModal, { question: "Continue?", dismiss() {} });

// @ts-expect-error Required modal input is missing.
AsyncModal.show(ChoiceModal, {});

function Backdrop({ children, dismiss }: AsyncModalBackdropProps) {
  return <section onClick={dismiss}>{children}</section>;
}

expectTypeOf(<AsyncModal.Host backdrop={Backdrop} />).toMatchTypeOf<ReactElement>();
expectTypeOf(
  <AsyncModal.Host dismissOnEscape={false} />,
).toMatchTypeOf<ReactElement>();
