import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import MobileSidebar from "./components/layout/MobileSidebar";
import Overview from "./components/pages/Overview/Overview";
import Transactions from "./components/pages/Transactions/Transactions";
import Categories from "./components/pages/Categories/Categories";
import Goals from "./components/pages/Goals/Goals";
import Subscriptions from "./components/pages/Subscriptions/Subscriptions";
import { useData } from "./context/DataContext";

const PAGES = {
  panoramica: Overview,
  transazioni: Transactions,
  categorie: Categories,
  obiettivi: Goals,
  abbonamenti: Subscriptions,
};

export default function App() {
  const { loading } = useData();
  const [currentPage, setCurrentPage] = useState("panoramica");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--light-bg-main-color) dark:bg-(--dark-bg-dashboard)">
        <p className="text-(--dark-third-color) text-sm">Caricamento...</p>
      </div>
    );
  }

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
        <PageComponent onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}
