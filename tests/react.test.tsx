// @vitest-environment jsdom

import { act, useEffect, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  AsyncModal,
  type AsyncModalBackdropProps,
  type ModalProps,
} from "../src/react";

type TestModalProps = ModalProps<{ label: string }, string>;

function TestModal({ label, resolve, reject, dismiss }: TestModalProps) {
  return (
    <div data-modal-content="">
      <span>{label}</span>
      <button onClick={() => resolve("accepted")}>Resolve</button>
      <button onClick={() => reject(new Error("failed"))}>Reject</button>
      <button onClick={dismiss}>Dismiss</button>
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(element: ReactElement): void {
  act(() => root.render(element));
}

function click(selector: string): void {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing test element: ${selector}`);
  act(() => element.click());
}

function mouseDown(selector: string): void {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing test element: ${selector}`);
  act(() =>
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })),
  );
}

test("throws when show is called without a mounted host", () => {
  expect(() =>
    AsyncModal.show(TestModal, { label: "Question" }),
  ).toThrowError(
    "[async-react-modal] AsyncModal.show() was called without a mounted <AsyncModal.Host />.",
  );
});

test("renders input props and resolves the modal result", async () => {
  render(<AsyncModal.Host />);

  let result!: Promise<string | undefined>;
  act(() => {
    result = AsyncModal.show(TestModal, { label: "Question" });
  });

  expect(container.textContent).toContain("Question");
  click("button");

  await expect(result).resolves.toBe("accepted");
  expect(container.querySelector("[data-modal-content]")).toBeNull();
});

test("dismisses to undefined and rejects explicit failures", async () => {
  render(<AsyncModal.Host />);

  let dismissed!: Promise<string | undefined>;
  act(() => {
    dismissed = AsyncModal.show(TestModal, { label: "Dismiss me" });
  });
  click("button:nth-of-type(3)");
  await expect(dismissed).resolves.toBeUndefined();

  let rejected!: Promise<string | undefined>;
  act(() => {
    rejected = AsyncModal.show(TestModal, { label: "Reject me" });
  });
  click("button:nth-of-type(2)");
  await expect(rejected).rejects.toThrow("failed");
});

test("the default backdrop dismisses only direct backdrop clicks", async () => {
  render(<AsyncModal.Host />);

  let result!: Promise<string | undefined>;
  act(() => {
    result = AsyncModal.show(TestModal, { label: "Question" });
  });

  mouseDown("[data-modal-content]");
  expect(container.querySelector("[data-modal-content]")).not.toBeNull();

  mouseDown("[data-async-react-modal-backdrop]");
  await expect(result).resolves.toBeUndefined();
});

test("queues modal calls and Escape dismisses the active modal", async () => {
  render(<AsyncModal.Host />);

  let first!: Promise<string | undefined>;
  let second!: Promise<string | undefined>;
  act(() => {
    first = AsyncModal.show(TestModal, { label: "First" });
    second = AsyncModal.show(TestModal, { label: "Second" });
  });

  expect(container.textContent).toContain("First");
  expect(container.textContent).not.toContain("Second");

  act(() =>
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
  );
  await expect(first).resolves.toBeUndefined();
  expect(container.textContent).not.toContain("First");
  expect(container.textContent).toContain("Second");

  click("button:nth-of-type(3)");
  await expect(second).resolves.toBeUndefined();
});

test("restores focus after the modal settles", async () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  render(<AsyncModal.Host />);

  let result!: Promise<string | undefined>;
  act(() => {
    result = AsyncModal.show(TestModal, { label: "Question" });
  });
  click("button:nth-of-type(3)");

  await result;
  expect(document.activeElement).toBe(opener);
  opener.remove();
});

test("allows show from an initial application effect", () => {
  function App() {
    useEffect(() => {
      void AsyncModal.show(TestModal, { label: "Opened from effect" });
    }, []);

    return <AsyncModal.Host />;
  }

  expect(() => render(<App />)).not.toThrow();
  expect(container.textContent).toContain("Opened from effect");
});

test("dismisses pending modals when the host unmounts", async () => {
  render(<AsyncModal.Host />);

  let result!: Promise<string | undefined>;
  act(() => {
    result = AsyncModal.show(TestModal, { label: "Pending" });
  });
  act(() => root.unmount());

  await expect(result).resolves.toBeUndefined();
});

test("renders a custom backdrop", () => {
  function CustomBackdrop({ children }: AsyncModalBackdropProps) {
    return <aside data-custom-backdrop="">{children}</aside>;
  }

  render(<AsyncModal.Host backdrop={CustomBackdrop} />);
  act(() => {
    void AsyncModal.show(TestModal, { label: "Custom" });
  });

  expect(container.querySelector("[data-custom-backdrop]")).not.toBeNull();
});

test("ignores settlement attempts after the first one", async () => {
  let controls!: TestModalProps;

  function CapturingModal(props: TestModalProps) {
    controls = props;
    return null;
  }

  render(<AsyncModal.Host />);
  let result!: Promise<string | undefined>;
  act(() => {
    result = AsyncModal.show(CapturingModal, { label: "Question" });
  });
  act(() => {
    controls.resolve("first");
    controls.resolve("second");
    controls.dismiss();
  });

  await expect(result).resolves.toBe("first");
});

test("rejects a second mounted host", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() =>
    render(
      <>
        <AsyncModal.Host />
        <AsyncModal.Host />
      </>,
    ),
  ).toThrowError(
    "[async-react-modal] Only one <AsyncModal.Host /> can be mounted at a time.",
  );

  consoleError.mockRestore();
});
