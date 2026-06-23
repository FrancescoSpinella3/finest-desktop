import { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useData } from "../../../context/DataContext";
import { ICON_KEYS, CategoryIcon } from "../../../util/icons.jsx";

const TYPE_LABELS = { income: "Entrata", expense: "Uscita", saving: "Risparmio" };

export default function CategoryModal({ open, onClose, editingCategory, onSaved }) {
  const { addCategory, updateCategory } = useData();

  const [form, setForm] = useState({ name: "", type: "expense", icon: ICON_KEYS[0] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setForm({ name: editingCategory.name, type: editingCategory.type, icon: editingCategory.icon });
    } else {
      setForm({ name: "", type: "expense", icon: ICON_KEYS[0] });
    }
    setErrors({});
  }, [editingCategory, open]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Inserisci un nome" });
      return;
    }

    const action = editingCategory
      ? updateCategory(editingCategory.id, form)
      : addCategory(form);

    setSubmitting(true);
    action.then(() => {
      onSaved(editingCategory ? "Categoria aggiornata" : "Categoria aggiunta");
      onClose();
    }).finally(() => setSubmitting(false));
  }

  return (
    <Modal
      title={editingCategory ? "Modifica categoria" : "Nuova categoria"}
      subText="Inserisci nome, tipo e icona della categoria"
      open={open}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome"
          placeholder="Es. Alimentari"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <Select label="Tipo" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <div>
          <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide block mb-2">
            Icona
          </span>
          <div className="grid grid-cols-7 gap-2">
            {ICON_KEYS.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setForm((f) => ({ ...f, icon: key }))}
                className={`size-9 rounded-lg flex items-center justify-center cursor-pointer border transition-colors ${
                  form.icon === key
                    ? "bg-(--main-color) text-white border-(--main-color)"
                    : "border-(--light-border-color) dark:border-(--dark-border-color) text-(--dark-second-color) dark:text-(--dark-third-color) hover:border-(--main-color)"
                }`}
              >
                <CategoryIcon icon={key} className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : editingCategory ? "Salva modifiche" : "Aggiungi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
