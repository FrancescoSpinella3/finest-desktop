import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, subText, open, onClose, children, widthClass = "max-w-md" }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${widthClass} bg-(--light-bg-modal) dark:bg-(--dark-bg-modal) rounded-2xl border border-(--light-border-color) dark:border-(--dark-border-color) shadow-xl p-6`}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-(--dark-main-color) dark:text-(--light-color)">{title}</h3>
            {subText && (
              <p className="text-sm text-(--dark-third-color) mt-1">{subText}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer rounded-lg p-1"
            aria-label="Chiudi"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
