import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 bg-(--light-bg-modal) dark:bg-(--dark-bg-modal) border border-(--light-border-color) dark:border-(--dark-border-color) rounded-xl shadow-lg px-4 py-3 text-sm text-(--dark-main-color) dark:text-(--light-color) min-w-64 animate-[fadeIn_.15s_ease]"
          >
            {t.type === "success" ? (
              <CheckCircle2 className="size-4 text-(--success-color) shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-(--danger-color) shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-(--dark-third-color) cursor-pointer">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
