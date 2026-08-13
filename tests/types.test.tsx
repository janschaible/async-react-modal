import { expectTypeOf, test } from "vitest";
import type { ReactElement } from "react";
import {
  AsyncModal,
  type AsyncModalBackdropProps,
  type ModalProps,
} from "../src/react";

type ChoiceProps = {
  question: string;
};

function ChoiceModal(
  _props: ModalProps<ChoiceProps, "yes" | "no">,
) {
  return null;
}

test("infers the modal result and accepts only caller-owned props", () => {
  const result = AsyncModal.show(ChoiceModal, { question: "Continue?" });
  expectTypeOf(result).toEqualTypeOf<Promise<"yes" | "no">>();
});

test("accepts a custom backdrop on the host", () => {
  function Backdrop({ children, dismiss }: AsyncModalBackdropProps) {
    return <section onClick={dismiss}>{children}</section>;
  }

  expectTypeOf(<AsyncModal.Host backdrop={Backdrop} />).toMatchTypeOf<ReactElement>();
});
