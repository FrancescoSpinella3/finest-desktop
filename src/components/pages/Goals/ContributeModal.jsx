import { useState } from "react";
import Modal from "../../ui/Modal";
import { Input } from "../../ui/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useData } from "../../../context/DataContext";

export default function ContributeModal({ open, onClose, goal, onSaved }) {
  const { contributeGoal } = useData();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num === 0) {
      setError("Inserisci un importo valido");
      return;
    }
    setSubmitting(true);
    contributeGoal(goal.id, num).then(() => {
      onSaved("Importo aggiornato");
      setAmount("");
      setError("");
      onClose();
    }).finally(() => setSubmitting(false));
  }

  if (!goal) return null;

  return (
    <Modal title={`Aggiorna "${goal.name}"`} subText="Aggiungi (o sottrai con un valore negativo) un importo" open={open} onClose={submitting ? () => {} : onClose} widthClass="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Importo (€)"
          type="number"
          step="0.01"
          placeholder="Es. 100 oppure -50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : "Conferma"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
