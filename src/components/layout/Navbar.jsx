import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const TITLES = {
  panoramica: "Panoramica",
  transazioni: "Transazioni",
  categorie: "Categorie",
  obiettivi: "Obiettivi",
  abbonamenti: "Abbonamenti",
};

export default function Navbar({ currentPage, isCollapsed, onToggleSidebar, onToggleMobileSidebar }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-30 h-20 flex items-end justify-between px-5 pb-2 md:px-7 bg-(--light-bg-main-color)/90 dark:bg-(--dark-bg-dashboard)/90 backdrop-blur-sm border-b border-(--light-border-color) dark:border-(--dark-border-color) duration-300 ${
        isCollapsed ? "md:ml-20" : "md:ml-64"
      }`}
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" }}>
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--main-color) cursor-pointer"
          aria-label="Comprimi sidebar"
        >
          {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-(--dark-second-color) dark:text-(--dark-third-color) cursor-pointer"
          aria-label="Apri menu"
        >
          <Menu className="size-5" />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-(--dark-main-color) dark:text-(--light-color)">
          {TITLES[currentPage]}
        </h2>
      </div>

      <button
        onClick={toggleTheme}
        className="size-8 rounded-full flex items-center justify-center bg-(--light-bg-container) dark:bg-(--dark-bg-container) border border-(--light-border-color) dark:border-(--dark-border-color) text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--main-color) cursor-pointer"
        aria-label="Cambia tema"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
    </div>
  );
}
