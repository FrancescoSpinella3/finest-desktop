import { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useData } from "../../../context/DataContext";
import { todayISO } from "../../../util/dateUtils";

const TYPE_LABELS = { income: "Entrata", expense: "Uscita", saving: "Risparmio" };

export default function TransactionModal({ open, onClose, editingTransaction, onSaved }) {
  const { categories, addTransaction, updateTransaction } = useData();

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function emptyForm() {
    return { description: "", amount: "", type: "expense", categoryId: "", date: todayISO() };
  }

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        description: editingTransaction.description,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        categoryId: editingTransaction.categoryId || "",
        date: editingTransaction.date,
      });
    } else {
      setForm(emptyForm());
    }
  }, [editingTransaction, open]);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  function validate() {
    const errs = {};
    if (!form.description.trim()) errs.description = "Inserisci una descrizione";
    const amountNum = parseFloat(form.amount);
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) errs.amount = "Inserisci un importo valido";
    if (!form.date) errs.date = "Inserisci una data";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      categoryId: form.categoryId || null,
      date: form.date,
    };

    const action = editingTransaction
      ? updateTransaction(editingTransaction.id, payload)
      : addTransaction(payload);

    setSubmitting(true);
    action.then(() => {
      onSaved(editingTransaction ? "Transazione aggiornata" : "Transazione aggiunta");
      onClose();
    }).finally(() => setSubmitting(false));
  }

  return (
    <Modal
      title={editingTransaction ? "Modifica transazione" : "Nuova transazione"}
      subText="Inserisci i dettagli della transazione"
      open={open}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setForm((f) => ({ ...f, type: value, categoryId: "" }))}
              className={`rounded-lg py-2 text-sm font-medium border cursor-pointer transition-colors ${
                form.type === value
                  ? "bg-(--main-color) text-white border-(--main-color)"
                  : "border-(--light-border-color) dark:border-(--dark-border-color) text-(--dark-second-color) dark:text-(--dark-third-color)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Input
          label="Descrizione"
          placeholder="Es. Spesa supermercato"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Importo (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            error={errors.amount}
          />
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            error={errors.date}
          />
        </div>

        <Select
          label="Categoria"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Nessuna categoria</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : editingTransaction ? "Salva modifiche" : "Aggiungi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
