import { memo } from "react";
import type { AdminUser, AdminStats } from "../types";
import { DownloadIcon, ExternalLinkIcon, PlusIcon, SearchIcon, TrashIcon, TrendIcon, UsersIcon } from "../icons";

type DashboardViewProps = {
  stats: AdminStats;
  users: AdminUser[];
  allUsers: AdminUser[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onAddPointsForUser: (phone: string) => void;
  onDeleteUser: (user: AdminUser) => void;
  onExportCSV: (allUsers: AdminUser[]) => void;
};

export const DashboardView = memo(function DashboardView({
  stats,
  users,
  allUsers,
  searchTerm,
  onSearchTermChange,
  onAddPointsForUser,
  onDeleteUser,
  onExportCSV,
}: DashboardViewProps) {
  return (
    <>
      <section className="panel-grid">
        <article className="kpi-card">
          <span className="kpi-label">Base de clientes</span>
          <strong className="kpi-value">{stats.clients}</strong>
          <div className="kpi-icon">
            <UsersIcon />
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">Total de visitas</span>
          <strong className="kpi-value">{stats.visits}</strong>
          <div className="kpi-icon">
            <TrendIcon />
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Gestao de clientes</h2>
            <p className="section-subtitle">Busque rapidamente e acione acoes diretas.</p>
          </div>
          <div className="section-head-actions">
            <label className="search-wrap" title="Buscar por nome ou telefone">
              <span className="search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="input-field"
                placeholder="Nome ou telefone..."
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
              />
            </label>
            <button
              className="btn btn-export"
              title={`Exportar ${allUsers.length} clientes como planilha`}
              onClick={() => onExportCSV(allUsers)}
              disabled={allUsers.length === 0}
            >
              <DownloadIcon />
              Exportar planilha
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <UsersIcon />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <div className="table-head row-grid">
              <span>Cliente</span>
              <span>WhatsApp</span>
              <span>Saldo</span>
              <span>Visitas</span>
              <span>Acoes</span>
            </div>
            {users.map((user) => (
              <div key={user.id} className="table-row row-grid">
                <div className="row-main">{user.name}</div>
                <div className="row-muted">{user.phone}</div>
                <div className="row-points">{user.totalPoints} pts</div>
                <div className="row-muted">{user._count?.transactions || 0}</div>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    title="Adicionar pontos"
                    onClick={() => onAddPointsForUser(user.phone)}
                  >
                    <PlusIcon />
                  </button>
                  <a
                    href={`https://wa.me/55${user.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn success"
                    title="Abrir WhatsApp"
                  >
                    <ExternalLinkIcon />
                  </a>
                  <button
                    className="icon-btn danger"
                    title="Excluir cliente"
                    onClick={() => onDeleteUser(user)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
});
