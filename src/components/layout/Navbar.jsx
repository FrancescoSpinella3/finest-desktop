import { AlertCircle, ArrowRight, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const TITLES = {
  panoramica: "Panoramica",
  transazioni: "Transazioni",
  categorie: "Categorie",
  obiettivi: "Obiettivi",
  abbonamenti: "Abbonamenti",
  impostazioni: "Impostazioni",
};

export default function Navbar({ currentPage, isCollapsed, onToggleSidebar, onToggleMobileSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
    <div
      className={`fixed top-0 right-0 left-0 z-30 h-22 flex items-end justify-between px-5 pb-2.5 bg-(--light-bg-main-color)/90 dark:bg-(--dark-bg-dashboard)/90 backdrop-blur-sm border-b border-(--light-border-color) dark:border-(--dark-border-color) duration-300 ${
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
        <h2 className="text-lg md:text-2xl font-bold text-(--dark-main-color) dark:text-(--light-color)">
          {TITLES[currentPage]}
        </h2>
      </div>

      <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" }}>
        <button
          onClick={toggleTheme}
          className="size-8 rounded-full flex items-center justify-center bg-(--light-bg-container) dark:bg-(--dark-bg-container) border border-(--light-border-color) dark:border-(--dark-border-color) text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--main-color) cursor-pointer"
          aria-label="Cambia tema"
        >
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-1.5 bg-(--danger-color) hover:bg-(--danger-hover-color) text-white text-sm font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition-colors duration-150"
          aria-label="Esci"
        >
          Esci <ArrowRight className="size-4" />
        </button>
      </div>
    </div>

    {showLogoutModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
      >
        <div className="w-full max-w-sm bg-(--light-bg-modal) dark:bg-(--dark-bg-modal) rounded-2xl border border-(--light-border-color) dark:border-(--dark-border-color) shadow-xl p-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer rounded-lg p-1"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-4 mt-1 mb-6">
            <div className="size-16 rounded-full bg-yellow-400/15 flex items-center justify-center">
              <AlertCircle className="size-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--dark-main-color) dark:text-(--light-color)">
                Sei sicuro di voler uscire dal tuo account?
              </h3>
              <p className="text-sm text-(--dark-second-color) dark:text-(--dark-third-color) mt-1.5">
                Verrai reindirizzato alla pagina di login.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setShowLogoutModal(false); signOut(); }}
              className="w-full bg-(--main-color) hover:bg-(--hover-main-color) text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
            >
              Effettua il logout
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="w-full text-sm font-semibold text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) py-2 cursor-pointer transition-colors duration-150"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
