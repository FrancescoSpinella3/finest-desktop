import { ChevronRight, CreditCard } from "lucide-react";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { formatDateIT } from "../../../util/dateUtils";
import { daysUntil } from "../../../util/subscriptionUtils";

function ExpiryBadge({ days }) {
  if (days <= 3)
    return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-700/10 text-(--danger-color)">{days}g</span>;
  if (days <= 7)
    return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-orange-700/10 text-(--warning-color)">{days}g</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-700/10 text-(--success-color)">{days}g</span>;
}

export default function RecentSubscriptions({ onNavigate }) {
  const { subscriptions } = useData();

  const sorted = [...subscriptions]
    .sort((a, b) => daysUntil(a.expiryDay) - daysUntil(b.expiryDay))
    .slice(0, 3);

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5 flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Prossimi</p>
          <p className="text-xl font-bold text-(--dark-main-color) dark:text-(--light-color)">Abbonamenti</p>
        </div>
        <button
          onClick={() => onNavigate("abbonamenti")}
          className="text-xs font-semibold text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer flex items-center gap-0.5 mt-1"
        >
          Vedi tutti <ChevronRight className="size-3.5" />
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-(--dark-third-color) py-6 text-center">
          Nessun abbonamento registrato.
        </p>
      ) : (
        <div className="flex flex-col">
          {sorted.map((sub) => {
            const days = daysUntil(sub.expiryDay);
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-(--light-border-color) dark:border-(--dark-border-color) last:border-none"
              >
                <div className="size-9 rounded-lg border border-(--light-border-color) dark:border-(--dark-border-color) bg-(--light-bg-table-head) dark:bg-(--dark-bg-table-head) flex items-center justify-center shrink-0 overflow-hidden">
                  {sub.logo
                    ? <img src={sub.logo} alt={sub.name} className="size-full object-contain p-1.5" />
                    : <CreditCard className="size-5 text-(--dark-third-color)" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--dark-main-color) dark:text-(--light-color) truncate">
                    {sub.name}
                  </p>
                  <p className="text-xs text-(--dark-third-color)">
                    Utimo rinnovo: {sub.lastRenewal ? formatDateIT(sub.lastRenewal) : "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {sub.cost != null && (
                    <span className="text-sm font-semibold text-(--dark-main-color) dark:text-(--light-color)">
                      {currencyFormatter.format(sub.cost)}
                    </span>
                  )}
                  <ExpiryBadge days={days} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
