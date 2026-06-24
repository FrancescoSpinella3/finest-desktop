import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import MobileSidebar from "./components/layout/MobileSidebar";
import Overview from "./components/pages/Overview/Overview";
import Transactions from "./components/pages/Transactions/Transactions";
import Categories from "./components/pages/Categories/Categories";
import Goals from "./components/pages/Goals/Goals";
import Subscriptions from "./components/pages/Subscriptions/Subscriptions";
import Settings from "./components/pages/Settings/Settings";
import { useData } from "./context/DataContext";
import { useAuth } from "./context/AuthContext";
import AuthScreen from "./components/auth/AuthScreen";
import Spinner from "./components/ui/Spinner";

const PAGES = {
  panoramica: Overview,
  transazioni: Transactions,
  categorie: Categories,
  obiettivi: Goals,
  abbonamenti: Subscriptions,
  impostazioni: Settings,
};

function useUpdater() {
  const [updateStatus, setUpdateStatus] = useState(null); // null | "available" | "downloading" | "ready"
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!window.api) return;
    window.api.getUpdateStatus().then(s => {
      console.log("[updater] status on mount:", s);
      if (s === "ready") setUpdateStatus("ready");
    });
    window.api.onUpdateAvailable(() => { console.log("[updater] update available"); setUpdateStatus("available"); });
    window.api.onDownloadProgress((pct) => { console.log("[updater] progress:", pct); setUpdateStatus("downloading"); setProgress(pct); });
    window.api.onUpdateReady(() => { console.log("[updater] ready"); setUpdateStatus("ready"); });
  }, []);

  return { updateStatus, progress };
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { loading } = useData();
  const [currentPage, setCurrentPage] = useState("panoramica");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { updateStatus, progress } = useUpdater();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--light-bg-main-color) dark:bg-(--dark-bg-dashboard)">
        <Spinner className="size-9 text-(--dark-third-color)" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const PageComponent = PAGES[currentPage];

  return (
    <div className="bg-(--light-bg-main-color) dark:bg-(--dark-bg-dashboard) min-h-screen">
      <Sidebar isCollapsed={sidebarCollapsed} currentPage={currentPage} onNavigate={setCurrentPage} />

      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <Navbar
        currentPage={currentPage}
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
      />

      <div className={`min-h-screen duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        {updateStatus && (
          <div className="fixed bottom-5 right-5 z-50 bg-(--dark-bg-bar) text-(--light-color) rounded-xl shadow-xl px-5 py-3.5 flex items-center gap-4 max-w-sm">
            {updateStatus === "available" && <p className="text-sm">Nuovo aggiornamento disponibile, download in corso...</p>}
            {updateStatus === "downloading" && (
              <div className="flex flex-col gap-1.5 flex-1">
                <p className="text-sm">Download aggiornamento... {progress}%</p>
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-(--main-color) rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {updateStatus === "ready" && (
              <>
                <p className="text-sm flex-1">Aggiornamento pronto.</p>
                <button
                  onClick={() => setUpdateStatus(null)}
                  className="text-sm text-white/60 hover:text-white/90 cursor-pointer shrink-0"
                >
                  Più tardi
                </button>
                <button
                  onClick={() => window.api.quitAndInstall()}
                  className="text-sm font-semibold bg-(--main-color) hover:opacity-90 px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
                >
                  Riavvia ora
                </button>
              </>
            )}
          </div>
        )}
        <PageComponent onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}
