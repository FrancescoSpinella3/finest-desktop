import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Spinner from "./Spinner";

export default function ConfirmModal({ open, title, message, onConfirm, onClose, confirmLabel = "Elimina" }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={title} open={open} onClose={loading ? () => {} : onClose} widthClass="max-w-sm">
      <p className="text-sm text-(--dark-second-color) dark:text-(--dark-third-color) mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Annulla
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? <Spinner /> : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
