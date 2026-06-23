import { useState } from "react";
import { Plus } from "lucide-react";
import Section from "../../ui/Section";
import Button from "../../ui/Button";
import ConfirmModal from "../../ui/ConfirmModal";
import CategoryModal from "./CategoryModal";
import CategoryCard from "./CategoryCard";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";

const GROUPS = [
  { type: "income", label: "Entrate" },
  { type: "expense", label: "Uscite" },
  { type: "saving", label: "Risparmi" },
];

export default function Categories() {
  const { categories, deleteCategory } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setModalOpen(true);
  }

  function handleDelete() {
    return deleteCategory(deletingId).then(() => showToast("Categoria eliminata"));
  }

  return (
    <Section>
      <div className="flex justify-end mb-5">
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Nuova categoria
        </Button>
      </div>

      <div className="flex flex-col gap-7">
        {GROUPS.map(({ type, label }) => {
          const items = categories.filter((c) => c.type === type);
          return (
            <div key={type}>
              <h4 className="text-sm font-semibold text-(--dark-third-color) uppercase tracking-wide mb-3">
                {label}
              </h4>
              {items.length === 0 ? (
                <p className="text-sm text-(--dark-third-color) py-3">Nessuna categoria in questo gruppo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => openEdit(category)}
                      onDelete={() => setDeletingId(category.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editing}
        onSaved={(msg) => showToast(msg)}
      />

      <ConfirmModal
        open={!!deletingId}
        title="Eliminare la categoria?"
        message="Le transazioni e gli obiettivi collegati resteranno ma mostreranno 'categoria eliminata'."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Section>
  );
}
