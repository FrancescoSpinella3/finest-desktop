import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "../../../util/icons.jsx";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { TYPE_ICON } from "../../../util/typeStyles";

export default function CategoryCard({ category, onEdit, onDelete }) {
  const { transactions } = useData();
  const total = transactions
    .filter((t) => t.categoryId === category.id)
    .reduce((acc, t) => acc + t.amount, 0);
  const count = transactions.filter((t) => t.categoryId === category.id).length;

  return (
    <div className="bg-(--light-bg-category-card) dark:bg-(--dark-bg-category-card) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-4 flex items-center gap-3 group">
      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON[category.type]}`}>
        <CategoryIcon icon={category.icon} className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--dark-main-color) dark:text-(--light-color) truncate">
          {category.name}
        </p>
        <p className="text-xs text-(--dark-third-color)">
          {count} transazion{count === 1 ? "e" : "i"} · {currencyFormatter.format(total)}
        </p>
      </div>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="text-(--dark-third-color) hover:text-(--main-color) cursor-pointer p-1"
          aria-label="Modifica categoria"
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={onDelete}
          className="text-(--dark-third-color) hover:text-(--danger-color) cursor-pointer p-1"
          aria-label="Elimina categoria"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
