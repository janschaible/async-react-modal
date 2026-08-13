import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AsyncModal,
  ModalDismissedError,
  type ModalProps,
} from "async-modal/react";

type ConfirmModalProps = {
  itemName: string;
};

type ConfirmModalResult = {
  accepted: boolean
}

function ConfirmModal({
  itemName,
  resolve,
}: ModalProps<ConfirmModalProps, ConfirmModalResult>) {
  return (
    <dialog aria-labelledby="confirm-title" className="modal" open>
      <h2 id="confirm-title">Delete {itemName}?</h2>
      <p>This is only a demo. Nothing important will be removed.</p>

      <div className="actions">
        <button onClick={() => resolve({accepted: false})}>Keep it</button>
        <button className="danger" onClick={() => resolve({accepted: true})}>
          Delete
        </button>
      </div>
    </dialog>
  );
}

function App() {
  const [status, setStatus] = useState("Nothing has happened yet.");

  async function askToDelete() {
    try {
      const confirmResult = await AsyncModal.show(ConfirmModal, {
        itemName: "quarterly-report.pdf",
      });

      setStatus(confirmResult.accepted ? "Deleted!" : "Kept safely.");
    } catch (error) {
      if (error instanceof ModalDismissedError) {
        setStatus("Dismissed by clicking the default backdrop.");
        return;
      }

      throw error;
    }
  }

  return (
    <main className="page">
      <section className="card">
        <span className="eyebrow">async-modal</span>
        <h1>Await a user decision</h1>
        <p>
          The component calls <code>resolve()</code>; the caller simply awaits
          the result.
        </p>

        <button className="primary" onClick={askToDelete}>
          Open confirm modal
        </button>

        <output>{status}</output>
      </section>

      <AsyncModal.Host />
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
