import { ArrowRightLeft, CreditCard, Goal, LayoutGrid, Settings, Tags } from "lucide-react";
import finestLogo from "/finest-logo.png";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { key: "panoramica", label: "Panoramica", icon: LayoutGrid },
  { key: "transazioni", label: "Transazioni", icon: ArrowRightLeft },
  { key: "abbonamenti", label: "Abbonamenti", icon: CreditCard },
  { key: "categorie", label: "Categorie", icon: Tags },
  { key: "obiettivi", label: "Obiettivi", icon: Goal },
  { key: "impostazioni", label: "Impostazioni", icon: Settings },
];

export default function Sidebar({ isCollapsed, currentPage, onNavigate }) {
  const { user, profile } = useAuth();
  const displayName = profile ? `${profile.name} ${profile.lastName}` : user?.email ?? "";
  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : (user?.email?.[0] ?? "?").toUpperCase();
  let sidebarClasses =
    "px-3 py-7 bg-(--light-bg-bar) dark:bg-(--dark-bg-bar) fixed top-0 left-0 h-screen z-40 border-r border-(--light-border-color) dark:border-(--dark-border-color) duration-300 hidden md:block";
  sidebarClasses += isCollapsed ? " w-20" : " w-64";

  let linkBase =
    "flex items-center rounded-xl py-2.5 font-medium gap-3 cursor-pointer transition-all duration-100 ease-in text-sm";
  linkBase += isCollapsed ? " px-3 w-fit justify-center" : " px-4";

  const activeClasses = " bg-blue-700/15 text-(--fourth-color) dark:text-(--third-color)";
  const inactiveClasses =
    " text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--fourth-color) dark:hover:text-(--light-color)";

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col items-center h-full">
        <div className={`flex items-center w-full ${isCollapsed ? "justify-center" : "px-2"}`}>
          <div className="flex items-center gap-3">
            <img src={finestLogo} alt="Finest" className="size-8 rounded-lg shrink-0 object-contain" />
            {!isCollapsed && (
              <h1 className="text-(--dark-main-color) dark:text-(--light-color) text-2xl font-extrabold">
                Finest
              </h1>
            )}
          </div>
        </div>

        <div className={`w-full flex flex-col gap-2 py-12 ${isCollapsed ? "items-center" : undefined}`}>
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={linkBase + (currentPage === key ? activeClasses : inactiveClasses)}
            >
              <Icon className="stroke-[2.1] size-5" />
              {!isCollapsed && label}
            </button>
          ))}
        </div>

        <div
          className={`mt-auto w-full flex items-center gap-3 px-2 pb-3 pt-10 border-t border-(--light-border-color) dark:border-(--dark-border-color) ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="size-9 rounded-full bg-(--third-color) flex items-center justify-center text-white text-base font-semibold shrink-0 overflow-hidden">
            {profile?.profileImage
              ? <img src={profile.profileImage} alt="avatar" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-(--dark-main-color) dark:text-(--light-color) truncate">
                {displayName}
              </p>
              <p className="text-xs text-(--dark-third-color) truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
