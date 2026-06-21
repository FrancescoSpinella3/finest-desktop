import { ArrowDownLeft, ArrowUpRight, ChevronRight, PiggyBank } from "lucide-react";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { CategoryIcon } from "../../../util/icons.jsx";
import { formatDateIT } from "../../../util/dateUtils";
import { TYPE_AMOUNT_COLOR, TYPE_ICON, TYPE_SIGN } from "../../../util/typeStyles";

export default function RecentTransactions({ onNavigate }) {
  const { transactions, getCategoryById } = useData();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5 flex-2 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Recenti</p>
          <p className="text-xl font-bold text-(--dark-main-color) dark:text-(--light-color)">Ultime transazioni</p>
        </div>
        <button
          onClick={() => onNavigate("transazioni")}
          className="text-xs font-semibold text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer flex items-center gap-0.5 mt-1"
        >
          Vedi tutti <ChevronRight className="size-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-(--dark-third-color) py-6 text-center">
          Nessuna transazione registrata. Aggiungine una dalla pagina Transazioni.
        </p>
      ) : (
        <div className="flex flex-col">
          {recent.map((t) => {
            const category = getCategoryById(t.categoryId);
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-(--light-border-color) dark:border-(--dark-border-color) last:border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON[t.type]}`}>
                    <CategoryIcon icon={category?.icon} className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-(--dark-main-color) dark:text-(--light-color) truncate">
                      {t.description}
                    </p>
                    <p className="text-xs text-(--dark-third-color)">{formatDateIT(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${TYPE_AMOUNT_COLOR[t.type]}`}>
                  {TYPE_SIGN[t.type]}
                  {currencyFormatter.format(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
