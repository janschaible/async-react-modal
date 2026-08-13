# async-modal

Promise-based modal orchestration with React adapter.

```tsx
import { useState } from "react";
import {
  AsyncModal,
  ModalDismissedError,
  type ModalProps,
} from "async-modal/react";

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
    <dialog aria-labelledby="confirm-title" open>
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
    try {
      const result = await AsyncModal.show(ConfirmModal, {
        itemName: "quarterly-report.pdf",
      });

      // `result` is inferred as ConfirmModalResult.
      setStatus(result.accepted ? "Deleted!" : "Kept safely.");
    } catch (error) {
      if (error instanceof ModalDismissedError) {
        setStatus("Dismissed by clicking the default backdrop.");
        return;
      }

      throw error;
    }
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

React is a peer dependency and is not included in the package bundle. Import the
React API from `async-modal/react`.

## Custom backdrop

The host wraps every open modal in a backdrop. It supplies a usable default, or
you can replace it once for all modals rendered by that host:

```tsx
import {
  AsyncModal,
  type AsyncModalBackdropProps,
} from "async-modal/react";

function MyBackdrop({ children, dismiss }: AsyncModalBackdropProps) {
  return (
    <div className="my-backdrop" onMouseDown={dismiss}>
      <div onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

<AsyncModal.Host backdrop={MyBackdrop} />;
```

The modal components themselves only render their content. A backdrop receives
the modal as `children` and a `dismiss()` callback.

## Run the example

The example uses the development dependencies already required by this package:

```sh
npm run example
```

Then open <http://localhost:4173>.
