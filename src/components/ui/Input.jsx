export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-lg border border-(--light-border-color) dark:border-(--dark-border-color) bg-(--light-bg-input) dark:bg-(--dark-bg-input) text-(--dark-main-color) dark:text-(--light-color) px-3 py-2.5 text-sm outline-none focus:border-(--main-color) ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-(--danger-color)">{error}</span>}
    </label>
  );
}

export function Select({ label, error, className = "", children, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">
          {label}
        </span>
      )}
      <select
        className={`w-full rounded-lg border border-(--light-border-color) dark:border-(--dark-border-color) bg-(--light-bg-input) dark:bg-(--dark-bg-input) text-(--dark-main-color) dark:text-(--light-color) px-3 py-2.5 text-sm outline-none focus:border-(--main-color) ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-(--danger-color)">{error}</span>}
    </label>
  );
}
