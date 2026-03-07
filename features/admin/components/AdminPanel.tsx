"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { LoginView, LandingView, LoadingView } from "./AuthViews";
import { ToastStack } from "./ToastStack";
import { useAdminPanel } from "../hooks/useAdminPanel";

// Lazy load heavy views
const DashboardView = dynamic(() => import("./DashboardView").then(m => m.DashboardView), {
  loading: () => <LoadingView text="Carregando Painel..." />
});
const AdminWorkspace = dynamic(() => import("./AdminWorkspace").then(m => m.AdminWorkspace));
const RegisterClientForm = dynamic(() => import("./FormsView").then(m => m.RegisterClientForm));
const RegisterPointsForm = dynamic(() => import("./FormsView").then(m => m.RegisterPointsForm));
const RedeemRewardForm = dynamic(() => import("./FormsView").then(m => m.RedeemRewardForm));
const ServicesView = dynamic(() => import("./ServicesView").then(m => m.ServicesView));

function AdminPanelImpl() {
  const {
    view,
    setView,
    pageTitle,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    services,
    users,
    allUsers,
    stats,
    toasts,
    registerClientForm,
    setRegisterClientForm,
    registerPointsForm,
    setRegisterPointsForm,
    redeemForm,
    setRedeemForm,
    actions,
  } = useAdminPanel();

  if (view === "LOADING") {
    return <LoadingView text="Sincronizando dados..." />;
  }

  if (view === "LANDING") {
    return <LandingView onAccessPanel={() => setView("LOGIN")} />;
  }

  if (view === "LOGIN") {
    return (
      <LoginView
        loading={isSubmitting}
        onLogin={actions.handleLogin}
        onBack={() => setView("LANDING")}
      />
    );
  }

  return (
    <>
      <AdminWorkspace
        view={view}
        pageTitle={pageTitle}
        onNavigate={setView}
        onBackToDashboard={() => setView("DASHBOARD")}
        onLogout={actions.handleLogout}
      >
        {view === "DASHBOARD" && (
          <DashboardView
            stats={stats}
            users={users}
            allUsers={allUsers}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onAddPointsForUser={actions.startRegisterPointsForUser}
            onDeleteUser={actions.handleDeleteClient}
            onExportCSV={actions.handleExportCSV}
          />
        )}

        {view === "SERVICES" && <ServicesView services={services} />}

        {view === "POINTS" && (
          <RegisterPointsForm
            loading={isSubmitting}
            services={services}
            phone={registerPointsForm.phone}
            serviceId={registerPointsForm.serviceId}
            onPhoneChange={(value) =>
              setRegisterPointsForm((previous) => ({ ...previous, phone: value }))
            }
            onServiceChange={(value) =>
              setRegisterPointsForm((previous) => ({ ...previous, serviceId: value }))
            }
            onSubmit={actions.handleRegisterPoints}
          />
        )}

        {view === "REGISTER" && (
          <RegisterClientForm
            loading={isSubmitting}
            name={registerClientForm.name}
            phone={registerClientForm.phone}
            onNameChange={(value) =>
              setRegisterClientForm((previous) => ({ ...previous, name: value }))
            }
            onPhoneChange={(value) =>
              setRegisterClientForm((previous) => ({ ...previous, phone: value }))
            }
            onSubmit={actions.handleRegisterClient}
          />
        )}

        {view === "REDEEM" && (
          <RedeemRewardForm
            loading={isSubmitting}
            phone={redeemForm.phone}
            rewardId={redeemForm.rewardId}
            onPhoneChange={(value) =>
              setRedeemForm((previous) => ({ ...previous, phone: value }))
            }
            onRewardChange={(value) =>
              setRedeemForm((previous) => ({ ...previous, rewardId: value }))
            }
            onSubmit={actions.handleRedeemReward}
          />
        )}
      </AdminWorkspace>

      <ToastStack toasts={toasts} />
    </>
  );
}

export const AdminPanel = memo(AdminPanelImpl);
