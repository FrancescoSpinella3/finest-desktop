import { useState } from "react";
import { Plus } from "lucide-react";
import Section from "../../ui/Section";
import Button from "../../ui/Button";
import ConfirmModal from "../../ui/ConfirmModal";
import SubscriptionModal from "./SubscriptionModal";
import SubscriptionCard from "./SubscriptionCard";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import { currencyFormatter } from "../../../util/currencyFormatter";

export default function Subscriptions() {
  const { subscriptions, deleteSubscription } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(sub) {
    setEditing(sub);
    setModalOpen(true);
  }

  function handleDelete() {
    deleteSubscription(deletingId).then(() => showToast("Abbonamento eliminato"));
  }

  const totalMonthlyCost = subscriptions.reduce((s, sub) => s + (sub.cost ?? 0), 0);

  return (
    <Section>
      <div className="flex items-center justify-between mb-5">
        {subscriptions.some((s) => s.cost != null) ? (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Spesa mensile totale</span>
            <span className="text-2xl font-bold text-(--dark-main-color) dark:text-(--light-color)">
              {currencyFormatter.format(totalMonthlyCost)}
            </span>
          </div>
        ) : (
          <div />
        )}
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Nuovo abbonamento
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-10 text-center">
          <p className="text-(--dark-third-color)">
            Nessun abbonamento registrato. Aggiungi il tuo primo abbonamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={() => openEdit(sub)}
              onDelete={() => setDeletingId(sub.id)}
            />
          ))}
        </div>
      )}

      <SubscriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingSubscription={editing}
        onSaved={(msg) => showToast(msg)}
      />

      <ConfirmModal
        open={!!deletingId}
        title="Eliminare l'abbonamento?"
        message="Questa azione non può essere annullata."
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Section>
  );
}
