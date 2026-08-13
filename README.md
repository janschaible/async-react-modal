# async-react-modal

[![main build](https://img.shields.io/github/actions/workflow/status/janschaible/async-react-modal/ci.yml?branch=main&label=main)](https://github.com/janschaible/async-react-modal/actions/workflows/ci.yml?query=branch%3Amain)
[![dev build](https://img.shields.io/github/actions/workflow/status/janschaible/async-react-modal/ci.yml?branch=dev&label=dev)](https://github.com/janschaible/async-react-modal/actions/workflows/ci.yml?query=branch%3Adev)

Promise-based modal orchestration with React adapter.

```tsx
import { useState } from "react";
import {
  AsyncModal,
  type ModalProps,
} from "async-react-modal";

type ConfirmModalProps = {
  itemName: string;
};

type ConfirmModalResult = {
  accepted: boolean;
};

function ConfirmModal({
  itemName,
  resolve,
}: ModalProps<ConfirmModalProps, ConfirmModalResult>) {
  return (
    <dialog aria-labelledby="confirm-title" aria-modal="true" open>
      <h2 id="confirm-title">Delete {itemName}?</h2>
      <p>This is only a demo. Nothing important will be removed.</p>

      <button onClick={() => resolve({ accepted: false })}>Keep it</button>
      <button onClick={() => resolve({ accepted: true })}>Delete</button>
    </dialog>
  );
}

function App() {
  const [status, setStatus] = useState("Nothing has happened yet.");

  async function askToDelete() {
    const result = await AsyncModal.show(ConfirmModal, {
      itemName: "quarterly-report.pdf",
    });

    // Dismissing via the backdrop or Escape returns undefined.
    if (result === undefined) {
      setStatus("Dismissed.");
      return;
    }

    setStatus(result.accepted ? "Deleted!" : "Kept safely.");
  }

  return (
    <>
      <button onClick={askToDelete}>Open confirm modal</button>
      <output>{status}</output>
      <AsyncModal.Host />
    </>
  );
}
```

React is a peer dependency and is not included in the package bundle.

`<AsyncModal.Host />` must be mounted before calling `AsyncModal.show()`. A call
without a mounted host throws immediately instead of returning a promise that can
never settle. Mount exactly one host in the application.

If the host unmounts while modals are open, their pending calls are dismissed and
resolve with `undefined`.

## Custom backdrop

The host wraps every open modal in a backdrop. It supplies a usable default, or
you can replace it once for all modals rendered by that host:

```tsx
import {
  AsyncModal,
  type AsyncModalBackdropProps,
} from "async-react-modal";

function MyBackdrop({ children, dismiss }: AsyncModalBackdropProps) {
  return (
    <div className="my-backdrop" onMouseDown={dismiss}>
      <div onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

<AsyncModal.Host backdrop={MyBackdrop} />;
```

## Behavior

- Modal components only render their content.
- A backdrop receives the modal as `children` and a `dismiss()` callback.
- Pressing Escape dismisses the active modal by default. Disable this with
  `<AsyncModal.Host dismissOnEscape={false} />`.
- Multiple calls to `show()` are queued in first-in, first-out order. Only one
  modal is rendered at a time.
- Focus returns to the element that was active when the modal opened after it
  settles.

## Run the example

The example uses the development dependencies already required by this package:

```sh
npm run example
```

Then open <http://localhost:4173>.

The development toolchain and CI use Node.js 22. The published library supports
Node.js 18 and newer.
