import { CreditCard, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { nextExpiryDate, daysUntil as daysUntilExpiry } from "../../../util/subscriptionUtils";
import { useData } from "../../../context/DataContext";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ExpiryBadge({ days }) {
  if (days <= 3) {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-red-700/10 text-(--danger-color)">
        Scade tra {days} {days === 1 ? "giorno" : "giorni"}
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-orange-700/10 text-(--warning-color)">
        Scade tra {days} giorni
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-green-700/10 text-(--success-color)">
      Attivo
    </span>
  );
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const { getCategoryById } = useData();
  const category = subscription.categoryId ? getCategoryById(subscription.categoryId) : null;
  const days = daysUntilExpiry(subscription.expiryDay);
  const nextDate = nextExpiryDate(subscription.expiryDay);
  const nextDateStr = nextDate.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-lg border border-(--light-border-color) dark:border-(--dark-border-color) bg-(--light-bg-table-head) dark:bg-(--dark-bg-table-head) flex items-center justify-center shrink-0 overflow-hidden">
            {subscription.logo
              ? <img src={subscription.logo} alt={subscription.name} className="size-full object-contain p-1.5" />
              : <CreditCard className="size-5 text-(--dark-third-color)" />
            }
          </div>
          <p className="font-semibold text-(--dark-main-color) dark:text-(--light-color) truncate">{subscription.name}</p>
        </div>
        <ExpiryBadge days={days} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-(--dark-third-color)">Giorno di scadenza</span>
          <span className="font-medium text-(--dark-main-color) dark:text-(--light-color)">
            ogni {subscription.expiryDay} del mese
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--dark-third-color)">Prossimo rinnovo</span>
          <span
            className={`font-medium ${
              days <= 3
                ? "text-(--danger-color)"
                : days <= 7
                ? "text-(--warning-color)"
                : "text-(--dark-main-color) dark:text-(--light-color)"
            }`}
          >
            {nextDateStr}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--dark-third-color)">Ultimo rinnovo</span>
          <span className="font-medium text-(--dark-main-color) dark:text-(--light-color)">
            {formatDate(subscription.lastRenewal)}
          </span>
        </div>
        {subscription.cost != null && (
          <div className="flex justify-between text-sm">
            <span className="text-(--dark-third-color)">Costo mensile</span>
            <span className="font-medium text-(--dark-main-color) dark:text-(--light-color)">
              {currencyFormatter.format(subscription.cost)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-(--dark-third-color)">Rinnovo automatico</span>
          {category ? (
            <span className="flex items-center gap-1.5 font-medium text-(--success-color)">
              <span className="size-2 rounded-full bg-(--success-color) shrink-0" />
              <RefreshCw className="size-3" /> {category.name}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-(--dark-third-color)">
              <span className="size-2 rounded-full bg-(--danger-color) shrink-0" />
              Non attivo
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-1">
        <button onClick={onEdit} className="text-(--dark-third-color) hover:text-(--main-color) cursor-pointer">
          <Pencil className="size-4" />
        </button>
        <button onClick={onDelete} className="text-(--dark-third-color) hover:text-(--danger-color) cursor-pointer">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
