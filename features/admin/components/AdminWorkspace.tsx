import { memo, type ReactNode } from "react";
import { MENU_ITEMS } from "../constants";
import { ArrowLeftIcon, GiftIcon, PlusIcon, TableIcon, TrendIcon, UsersIcon } from "../icons";
import type { AppView } from "../types";

type AdminWorkspaceProps = {
  view: AppView;
  pageTitle: string;
  onNavigate: (view: Exclude<AppView, "LOADING" | "LANDING" | "LOGIN">) => void;
  onBackToDashboard: () => void;
  onLogout: () => void;
  children: ReactNode;
};

function menuIconByName(name: string) {
  switch (name) {
    case "trend":
      return <TrendIcon />;
    case "plus":
      return <PlusIcon />;
    case "users":
      return <UsersIcon />;
    case "gift":
      return <GiftIcon />;
    case "table":
      return <TableIcon />;
    default:
      return <TrendIcon />;
  }
}

export const AdminWorkspace = memo(function AdminWorkspace({
  view,
  pageTitle,
  onNavigate,
  onBackToDashboard,
  onLogout,
  children,
}: AdminWorkspaceProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate("DASHBOARD")}>
          Barber<span>Points</span>
        </button>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${view === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              {menuIconByName(item.icon)}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="btn btn-subtle logout" onClick={onLogout}>
          Sair do sistema
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="crumb">Painel administrativo</span>
            <h1>{pageTitle}</h1>
          </div>
          {view !== "DASHBOARD" && (
            <button className="btn btn-ghost back-btn" onClick={onBackToDashboard}>
              <ArrowLeftIcon />
              <span>Voltar ao painel</span>
            </button>
          )}
        </header>

        {children}
      </section>
    </main>
  );
});
