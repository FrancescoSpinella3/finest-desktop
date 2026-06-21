import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Section from "../../ui/Section";
import Button from "../../ui/Button";
import { Select } from "../../ui/Input";
import ConfirmModal from "../../ui/ConfirmModal";
import TransactionModal from "./TransactionModal";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { formatDateIT } from "../../../util/dateUtils";
import { CategoryIcon } from "../../../util/icons.jsx";
import { TYPE_AMOUNT_COLOR, TYPE_ICON, TYPE_SIGN } from "../../../util/typeStyles";

const TYPE_LABELS = { income: "Entrata", expense: "Uscita", saving: "Risparmio" };

export default function Transactions() {
  const { transactions, categories, getCategoryById, deleteTransaction } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  const filtered = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const periodStart = {
      week: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      months6: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      all: null,
    }[periodFilter];

    return [...transactions]
      .filter((t) => (typeFilter ? t.type === typeFilter : true))
      .filter((t) => (categoryFilter ? t.categoryId === categoryFilter : true))
      .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => (periodStart ? new Date(t.date) >= periodStart : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, typeFilter, categoryFilter, periodFilter]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(tx) {
    setEditing(tx);
    setModalOpen(true);
  }

  function handleDelete() {
    deleteTransaction(deletingId).then(() => showToast("Transazione eliminata"));
  }

  return (
    <Section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-(--dark-third-color)" />
          <input
            placeholder="Cerca transazione..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-(--light-border-color) dark:border-(--dark-border-color) bg-(--light-bg-input) dark:bg-(--dark-bg-input) text-(--dark-main-color) dark:text-(--light-color) pl-9 pr-3 py-2.5 text-sm outline-none focus:border-(--main-color)"
          />
        </div>

        <div className="flex gap-2">
          <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="py-2!">
            <option value="all">Tutto il periodo</option>
            <option value="week">Ultima settimana</option>
            <option value="months6">Ultimi 6 mesi</option>
            <option value="year">Ultimo anno</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="py-2!">
            <option value="">Tutti i tipi</option>
            <option value="income">Entrate</option>
            <option value="expense">Uscite</option>
            <option value="saving">Risparmi</option>
          </Select>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="py-2!">
            <option value="">Tutte le categorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Aggiungi
          </Button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Entrate", value: filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), color: "text-(--success-color)", bg: "bg-green-700/8" },
            { label: "Uscite",  value: filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), color: "text-(--danger-color)",  bg: "bg-red-700/8"   },
            { label: "Risparmi",value: filtered.filter(t => t.type === "saving").reduce((s, t) => s + t.amount, 0),  color: "text-yellow-500",        bg: "bg-yellow-500/8" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl p-4 flex flex-col gap-0.5 ${bg}`}>
              <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">{label}</span>
              <span className={`text-lg font-bold ${color}`}>{currencyFormatter.format(value)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) overflow-x-auto">
        <table className="w-full text-sm min-w-160">
          <thead>
            <tr className="bg-(--light-bg-table-head) dark:bg-(--dark-bg-table-head) text-left">
              <th className="px-5 py-3 font-semibold text-(--dark-third-color) text-xs tracking-wide">DESCRIZIONE</th>
              <th className="px-5 py-3 font-semibold text-(--dark-third-color) text-xs tracking-wide">CATEGORIA</th>
              <th className="px-5 py-3 font-semibold text-(--dark-third-color) text-xs tracking-wide">DATA</th>
              <th className="px-5 py-3 font-semibold text-(--dark-third-color) text-xs tracking-wide text-right">IMPORTO</th>
              <th className="px-5 py-3 font-semibold text-(--dark-third-color) text-xs tracking-wide text-right">AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-(--dark-third-color)">
                  Nessuna transazione trovata. Aggiungine una con il pulsante "Aggiungi".
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const category = getCategoryById(t.categoryId);
                return (
                  <tr
                    key={t.id}
                    className="border-t border-(--light-border-color) dark:border-(--dark-border-color) hover:bg-(--light-bg-table-head)/50 dark:hover:bg-(--dark-bg-table-head)/50"
                  >
                    <td className="px-5 py-3 text-(--dark-main-color) dark:text-(--light-color) font-medium">
                      {t.description}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${TYPE_ICON[t.type]}`}
                      >
                        <CategoryIcon icon={category?.icon} className="size-3.5" />
                        {category ? category.name : "Categoria eliminata"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-(--dark-third-color)">{formatDateIT(t.date)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${TYPE_AMOUNT_COLOR[t.type]}`}>
                      {TYPE_SIGN[t.type]}
                      {currencyFormatter.format(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="text-(--dark-third-color) hover:text-(--main-color) cursor-pointer"
                          aria-label="Modifica"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          className="text-(--dark-third-color) hover:text-(--danger-color) cursor-pointer"
                          aria-label="Elimina"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTransaction={editing}
        onSaved={(msg) => showToast(msg)}
      />

      <ConfirmModal
        open={!!deletingId}
        title="Eliminare la transazione?"
        message="Questa azione non puo' essere annullata."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Section>
  );
}
