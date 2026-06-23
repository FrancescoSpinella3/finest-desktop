import { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import Button from "../../ui/Button";
import { useData } from "../../../context/DataContext";

const TYPE_OPTIONS = [
  { value: "income", label: "Obiettivo di ricavi" },
  { value: "expense_limit", label: "Limite di spesa" },
  { value: "saving", label: "Obiettivo di risparmio" },
];

const CATEGORY_TYPE_MAP = { income: "income", expense_limit: "expense", saving: "saving" };

export default function GoalModal({ open, onClose, editingGoal, onSaved }) {
  const { categories, addGoal, updateGoal } = useData();

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  function emptyForm() {
    return { name: "", type: "saving", targetAmount: "", period: "mensile", categoryId: "" };
  }

  useEffect(() => {
    if (editingGoal) {
      setForm({
        name: editingGoal.name,
        type: editingGoal.type,
        targetAmount: String(editingGoal.targetAmount),
        period: editingGoal.period,
        categoryId: editingGoal.categoryId || "",
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [editingGoal, open]);

  const relevantCategories = categories.filter((c) => c.type === CATEGORY_TYPE_MAP[form.type]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Inserisci un nome";
    const targetNum = parseFloat(form.targetAmount);
    if (!form.targetAmount || isNaN(targetNum) || targetNum <= 0) errs.targetAmount = "Inserisci un importo valido";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      type: form.type,
      targetAmount: parseFloat(form.targetAmount),
      period: form.period,
      categoryId: form.categoryId || null,
    };

    const action = editingGoal ? updateGoal(editingGoal.id, payload) : addGoal(payload);

    action.then(() => {
      onSaved(editingGoal ? "Obiettivo aggiornato" : "Obiettivo creato");
      onClose();
    }).catch((err) => {
      console.error("GoalModal submit error:", err);
      setErrors({ submit: "Errore durante il salvataggio. Riprova." });
    });
  }

  return (
    <Modal
      title={editingGoal ? "Modifica obiettivo" : "Nuovo obiettivo"}
      subText="Definisci un obiettivo di ricavi, un limite di spesa o un obiettivo di risparmio"
      open={open}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Tipo di obiettivo"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, categoryId: "" }))}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Input
          label="Nome obiettivo"
          placeholder="Es. Fondo emergenza"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Importo obiettivo (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.targetAmount}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
            error={errors.targetAmount}
          />
          <Select label="Periodo" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}>
            <option value="mensile">Mensile</option>
            <option value="totale">Totale</option>
          </Select>
        </div>

        <Select
          label="Categoria collegata (opzionale)"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Nessuna - aggiornamento manuale</option>
          {relevantCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-(--dark-third-color) -mt-2">
          Se collegato a una categoria, il progresso si calcola automaticamente dalle transazioni. Altrimenti potrai
          aggiornarlo manualmente con il pulsante "Aggiungi importo".
        </p>

        {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit">{editingGoal ? "Salva modifiche" : "Crea obiettivo"}</Button>
        </div>
      </form>
    </Modal>
  );
}
