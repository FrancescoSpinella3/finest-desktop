export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-(--main-color) hover:bg-(--hover-main-color) text-white",
    secondary:
      "bg-transparent border border-(--light-border-color) dark:border-(--dark-border-color) text-(--dark-main-color) dark:text-(--light-color) hover:bg-(--light-bg-color) dark:hover:bg-(--dark-bg-input)",
    danger: "bg-(--danger-color) hover:bg-(--danger-hover-color) text-white",
    ghost:
      "bg-transparent text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color)",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
