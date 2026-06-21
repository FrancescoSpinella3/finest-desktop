import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ open, title, message, onConfirm, onClose, confirmLabel = "Elimina" }) {
  return (
    <Modal title={title} open={open} onClose={onClose} widthClass="max-w-sm">
      <p className="text-sm text-(--dark-second-color) dark:text-(--dark-third-color) mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Annulla
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
