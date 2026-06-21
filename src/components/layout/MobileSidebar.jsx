import { ArrowRightLeft, CreditCard, Goal, LayoutGrid, Settings, Tags, X } from "lucide-react";
import finestLogo from "/finest-logo.png";

const NAV_ITEMS = [
  { key: "panoramica", label: "Panoramica", icon: LayoutGrid },
  { key: "transazioni", label: "Transazioni", icon: ArrowRightLeft },
  { key: "abbonamenti", label: "Abbonamenti", icon: CreditCard },
  { key: "categorie", label: "Categorie", icon: Tags },
  { key: "obiettivi", label: "Obiettivi", icon: Goal },
  { key: "impostazioni", label: "Impostazioni", icon: Settings },
];

export default function MobileSidebar({ isOpen, onClose, currentPage, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-0 left-0 h-full w-64 bg-(--light-bg-bar) dark:bg-(--dark-bg-bar) p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={finestLogo} alt="Finest" className="size-8 rounded-lg object-contain" />
            <h1 className="text-(--dark-main-color) dark:text-(--light-color) text-xl font-extrabold">Finest</h1>
          </div>
          <button onClick={onClose} className="text-(--dark-third-color)" aria-label="Chiudi menu">
            <X className="size-5" />
          </button>
        </div>

        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              onNavigate(key);
              onClose();
            }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer ${
              currentPage === key
                ? "bg-blue-700/15 text-(--fourth-color) dark:text-(--third-color)"
                : "text-(--dark-second-color) dark:text-(--dark-third-color)"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
