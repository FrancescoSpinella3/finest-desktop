import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Modal from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useData } from "../../../context/DataContext";

function emptyForm() {
  return { name: "", expiryDay: "", lastRenewal: "", cost: "", logo: null, categoryId: "" };
}

export default function SubscriptionModal({ open, onClose, editingSubscription, onSaved }) {
  const { addSubscription, updateSubscription, categories } = useData();
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSubscription) {
      setForm({
        name: editingSubscription.name,
        expiryDay: String(editingSubscription.expiryDay),
        lastRenewal: editingSubscription.lastRenewal,
        cost: editingSubscription.cost != null ? String(editingSubscription.cost) : "",
        logo: editingSubscription.logo || null,
        categoryId: editingSubscription.categoryId || "",
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [editingSubscription, open]);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 128;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm((f) => ({ ...f, logo: canvas.toDataURL("image/webp", 0.85) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Inserisci il nome del servizio";
    if (!form.expiryDay) errs.expiryDay = "Seleziona il giorno di scadenza";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      expiryDay: parseInt(form.expiryDay, 10),
      lastRenewal: form.lastRenewal,
      cost: form.cost !== "" ? parseFloat(form.cost) : null,
      logo: form.logo,
      categoryId: form.categoryId || null,
    };

    const action = editingSubscription
      ? updateSubscription(editingSubscription.id, payload)
      : addSubscription(payload);

    setSubmitting(true);
    action.then(() => {
      onSaved(editingSubscription ? "Abbonamento aggiornato" : "Abbonamento aggiunto");
      onClose();
    }).finally(() => setSubmitting(false));
  }

  return (
    <Modal
      title={editingSubscription ? "Modifica abbonamento" : "Nuovo abbonamento"}
      subText="Registra un abbonamento con la sua data di scadenza e ultimo rinnovo"
      open={open}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Logo picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Logo</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="size-16 rounded-xl border-2 border-dashed border-(--light-border-color) dark:border-(--dark-border-color) flex items-center justify-center shrink-0 overflow-hidden hover:border-(--main-color) transition-colors cursor-pointer"
            >
              {form.logo ? (
                <img src={form.logo} alt="logo" className="size-full object-contain p-1" />
              ) : (
                <ImagePlus className="size-6 text-(--dark-third-color)" />
              )}
            </button>
            <div className="flex flex-col gap-1 text-xs text-(--dark-third-color)">
              <span>Clicca per caricare un'immagine</span>
              <span>PNG, JPG, SVG, WebP</span>
              {form.logo && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, logo: null }))}
                  className="flex items-center gap-1 text-(--danger-color) hover:underline cursor-pointer w-fit mt-0.5"
                >
                  <X className="size-3" /> Rimuovi logo
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <Input
          label="Nome del servizio"
          placeholder="Es. Netflix, Spotify..."
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <Select
          label="Giorno di scadenza mensile"
          value={form.expiryDay}
          onChange={(e) => setForm((f) => ({ ...f, expiryDay: e.target.value }))}
          error={errors.expiryDay}
        >
          <option value="">Seleziona giorno...</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select
          label="Categoria spesa (per rinnovo automatico)"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Nessuna — inserimento manuale</option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ultimo rinnovo"
            type="date"
            value={form.lastRenewal}
            onChange={(e) => setForm((f) => ({ ...f, lastRenewal: e.target.value }))}
            error={errors.lastRenewal}
          />
          <Input
            label="Costo mensile (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.cost}
            onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
            error={errors.cost}
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : editingSubscription ? "Salva modifiche" : "Aggiungi abbonamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
