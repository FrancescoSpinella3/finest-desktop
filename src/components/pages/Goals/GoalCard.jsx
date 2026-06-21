import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";

const TYPE_META = {
  income: { label: "Ricavo", badge: "bg-green-700/10 text-(--success-color)", bar: "bg-(--third-color)" },
  expense_limit: { label: "Limite spesa", badge: "bg-orange-700/10 text-(--warning-color)", bar: "bg-(--warning-color)" },
  saving: { label: "Risparmio", badge: "bg-yellow-500/10 text-yellow-500", bar: "bg-(--main-color)" },
};

export default function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const { computeGoalProgress, getCategoryById } = useData();
  const current = computeGoalProgress(goal);
  const pct = goal.targetAmount > 0 ? (current / goal.targetAmount) * 100 : 0;
  const meta = TYPE_META[goal.type];
  const category = goal.categoryId ? getCategoryById(goal.categoryId) : null;

  const isOverLimit = goal.type === "expense_limit" && pct >= 100;
  const barColor = isOverLimit ? "bg-(--danger-color)" : meta.bar;

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-(--dark-main-color) dark:text-(--light-color)">{goal.name}</p>
          <p className="text-xs text-(--dark-third-color) mt-0.5">
            {goal.period === "mensile" ? "Mensile" : "Totale"}
            {category ? ` · ${category.name}` : ""}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-md shrink-0 ${meta.badge}`}>{meta.label}</span>
      </div>

      <div>
        <div className="h-2.5 rounded-full bg-(--light-bg-table-head) dark:bg-(--dark-bg-table-head) overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-(--dark-third-color)">
            {currencyFormatter.format(current)} di {currencyFormatter.format(goal.targetAmount)}
          </p>
          <p className={`text-xs font-semibold ${isOverLimit ? "text-(--danger-color)" : "text-(--dark-third-color)"}`}>
            {Math.round(pct)}%
          </p>
        </div>
        {isOverLimit && <p className="text-xs text-(--danger-color) mt-1">Limite superato</p>}
      </div>

      <div className="flex justify-between items-center mt-1">
        {!goal.categoryId ? (
          <button
            onClick={onContribute}
            className="text-xs font-semibold text-(--main-color) hover:underline cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="size-3.5" />
            Aggiungi importo
          </button>
        ) : (
          <span className="text-xs text-(--dark-third-color)">Calcolo automatico</span>
        )}
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-(--dark-third-color) hover:text-(--main-color) cursor-pointer">
            <Pencil className="size-4" />
          </button>
          <button onClick={onDelete} className="text-(--dark-third-color) hover:text-(--danger-color) cursor-pointer">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
