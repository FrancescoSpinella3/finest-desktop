import { useState } from "react";
import { Plus } from "lucide-react";
import Section from "../../ui/Section";
import Button from "../../ui/Button";
import ConfirmModal from "../../ui/ConfirmModal";
import GoalModal from "./GoalModal";
import GoalCard from "./GoalCard";
import ContributeModal from "./ContributeModal";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";

export default function Goals() {
  const { goals, deleteGoal } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [contributing, setContributing] = useState(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(goal) {
    setEditing(goal);
    setModalOpen(true);
  }

  function handleDelete() {
    deleteGoal(deletingId).then(() => showToast("Obiettivo eliminato"));
  }

  return (
    <Section>
      <div className="flex justify-end mb-5">
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Nuovo obiettivo
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-10 text-center">
          <p className="text-(--dark-third-color)">
            Nessun obiettivo definito. Crea il tuo primo obiettivo di ricavi, limite di spesa o risparmio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => openEdit(goal)}
              onDelete={() => setDeletingId(goal.id)}
              onContribute={() => setContributing(goal)}
            />
          ))}
        </div>
      )}

      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingGoal={editing}
        onSaved={(msg) => showToast(msg)}
      />

      <ContributeModal
        open={!!contributing}
        goal={contributing}
        onClose={() => setContributing(null)}
        onSaved={(msg) => showToast(msg)}
      />

      <ConfirmModal
        open={!!deletingId}
        title="Eliminare l'obiettivo?"
        message="Questa azione non puo' essere annullata."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Section>
  );
}
