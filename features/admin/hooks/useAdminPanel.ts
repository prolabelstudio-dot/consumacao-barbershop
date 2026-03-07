import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PAGE_TITLES, REWARDS } from "../constants";
import {
  addPoints,
  deleteClient,
  getAdminUsers,
  getProducts,
  loginAdmin,
  redeemReward,
  registerClient,
} from "../services/adminApi";
import type { AdminStats, AdminUser, AppView, Product } from "../types";
import { buildServiceCatalog } from "../utils/serviceCatalog";
import { useToasts } from "./useToasts";

type RegisterClientForm = {
  name: string;
  phone: string;
};

type RegisterPointsForm = {
  phone: string;
  serviceId: string;
};

type RedeemForm = {
  phone: string;
  rewardId: string;
};

export function useAdminPanel() {
  const [view, setView] = useState<AppView>("LOADING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [services, setServices] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [registerClientForm, setRegisterClientForm] = useState<RegisterClientForm>({
    name: "",
    phone: "",
  });
  const [registerPointsForm, setRegisterPointsForm] = useState<RegisterPointsForm>({
    phone: "",
    serviceId: "",
  });
  const [redeemForm, setRedeemForm] = useState<RedeemForm>({
    phone: "",
    rewardId: REWARDS[0].id,
  });

  const { notify, toasts } = useToasts();

  const fetchUsers = useCallback(
    async (token: string) => {
      try {
        const response = await getAdminUsers(token);

        // Token expirado — tenta renovar automaticamente
        if (!response.ok && !Array.isArray(response.data)) {
          const errData = response.data as { error?: string };
          if (errData.error?.includes("inválido") || errData.error?.includes("expirado")) {
            localStorage.removeItem("token");
            try {
              const loginResponse = await loginAdmin();
              if (loginResponse.ok && loginResponse.data.token) {
                const newToken = loginResponse.data.token;
                localStorage.setItem("token", newToken);
                // Retry com novo token
                const retryResponse = await getAdminUsers(newToken);
                if (retryResponse.ok && Array.isArray(retryResponse.data)) {
                  setUsers(retryResponse.data);
                  return;
                }
              }
            } catch {
              // silencioso
            }
          }
          setUsers([]);
          return;
        }

        if (Array.isArray(response.data)) {
          setUsers(response.data);
        }
      } catch {
        setUsers([]);
        notify("Falha ao carregar clientes.", "error");
      }
    },
    [notify],
  );

  const fetchServices = useCallback(async () => {
    try {
      const response = await getProducts();
      const catalog = buildServiceCatalog(response.data);
      setServices(catalog);
      setRegisterPointsForm((previous) => ({
        ...previous,
        serviceId: previous.serviceId || catalog[0]?.id || "",
      }));
    } catch {
      const fallback = buildServiceCatalog([]);
      setServices(fallback);
      setRegisterPointsForm((previous) => ({
        ...previous,
        serviceId: previous.serviceId || fallback[0]?.id || "",
      }));
      notify("Nao foi possivel carregar servicos. Usando catalogo padrao.", "error");
    }
  }, [notify]);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        // Valida o token tentando buscar usuários
        try {
          const response = await getAdminUsers(token);
          if (response.ok) {
            // Token válido — carrega normalmente
            if (Array.isArray(response.data)) {
              setUsers(response.data);
            }
            setView("DASHBOARD");
          } else {
            // Token inválido/expirado — faz novo login automaticamente
            localStorage.removeItem("token");
            const loginResponse = await loginAdmin();
            if (loginResponse.ok && loginResponse.data.token) {
              localStorage.setItem("token", loginResponse.data.token);
              fetchUsers(loginResponse.data.token);
              setView("DASHBOARD");
            } else {
              setTimeout(() => setView("LANDING"), 500);
            }
          }
        } catch {
          localStorage.removeItem("token");
          setTimeout(() => setView("LANDING"), 500);
        }
      } else {
        // Sem token — faz login automático direto
        try {
          const loginResponse = await loginAdmin();
          if (loginResponse.ok && loginResponse.data.token) {
            localStorage.setItem("token", loginResponse.data.token);
            fetchUsers(loginResponse.data.token);
            setView("DASHBOARD");
          } else {
            setTimeout(() => setView("LANDING"), 500);
          }
        } catch {
          setTimeout(() => setView("LANDING"), 500);
        }
      }

      fetchServices();
    };

    initialize();
  }, [fetchServices, fetchUsers]);

  useEffect(() => {
    if (view === "POINTS" && services.length === 0) {
      fetchServices();
    }
  }, [fetchServices, services.length, view]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query),
    );
  }, [searchTerm, users]);

  const stats = useMemo<AdminStats>(() => {
    const visits = users.reduce(
      (total, user) => total + (user._count?.transactions || 0),
      0,
    );
    return { clients: users.length, visits };
  }, [users]);

  const handleLogin = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await loginAdmin();
      if (!response.ok || !response.data.token) {
        notify(response.data.error || "Falha no login.", "error");
        return;
      }

      localStorage.setItem("token", response.data.token);
      setView("DASHBOARD");
      fetchUsers(response.data.token);
      notify("Acesso autorizado com sucesso!");
    } catch {
      notify("Erro de conexao.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUsers, notify]);

  const handleRegisterClient = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) return;

      setIsSubmitting(true);
      try {
        const response = await registerClient(token, {
          name: registerClientForm.name,
          phone: registerClientForm.phone,
        });

        if (!response.ok) {
          notify(response.data.error || "Falha ao cadastrar cliente.", "error");
          return;
        }

        notify("Cliente cadastrado com sucesso!");
        setRegisterClientForm({ name: "", phone: "" });
        fetchUsers(token);
        setView("DASHBOARD");
      } catch {
        notify("Erro no cadastro.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUsers, notify, registerClientForm.name, registerClientForm.phone],
  );

  const handleRegisterPoints = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) return;

      setIsSubmitting(true);
      const service = services.find((item) => item.id === registerPointsForm.serviceId);
      try {
        const response = await addPoints(token, {
          targetPhone: registerPointsForm.phone,
          amountSpent: service?.price || 0,
          pointsEarned: service?.pointsAward || 10,
          description: service?.name || "Servico",
        });

        if (!response.ok) {
          notify(response.data.error || "Falha ao registrar atendimento.", "error");
          return;
        }

        notify(`+${service?.pointsAward || 10} pontos lancados!`);
        setRegisterPointsForm((previous) => ({ ...previous, phone: "" }));
        fetchUsers(token);
        setView("DASHBOARD");
      } catch {
        notify("Erro ao lancar pontos.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUsers, notify, registerPointsForm.phone, registerPointsForm.serviceId, services],
  );

  const handleRedeemReward = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) return;

      const reward = REWARDS.find((item) => item.id === redeemForm.rewardId);
      if (!reward) return;
      if (!confirm(`Confirmar resgate de ${reward.name}?`)) return;

      setIsSubmitting(true);
      try {
        const response = await redeemReward(token, {
          targetPhone: redeemForm.phone,
          pointsCost: reward.cost,
          description: `Resgate: ${reward.name}`,
        });

        if (!response.ok) {
          notify(response.data.error || "Falha ao resgatar recompensa.", "error");
          return;
        }

        notify("Recompensa resgatada com sucesso!");
        setRedeemForm((previous) => ({ ...previous, phone: "" }));
        fetchUsers(token);
        setView("DASHBOARD");
      } catch {
        notify("Erro no resgate.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUsers, notify, redeemForm.phone, redeemForm.rewardId],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setView("LANDING");
    notify("Voce saiu do sistema.");
  }, [notify]);

  const handleExportCSV = useCallback((allUsers: AdminUser[]) => {
    if (allUsers.length === 0) {
      notify("Nenhum cliente para exportar.", "error");
      return;
    }

    // Cabeçalho da planilha
    const header = ["Nome", "Telefone", "Pontos", "Nivel", "Visitas"];

    // Linhas de dados
    const rows = allUsers.map((user) => [
      user.name ?? "",
      user.phone ?? "",
      String(user.totalPoints ?? 0),
      user.currentTier ?? "Recruta",
      String(user._count?.transactions ?? 0),
    ]);

    // Monta o CSV com separador ponto-e-vírgula (padrão Excel pt-BR)
    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\r\n");

    // Adiciona BOM para o Excel reconhecer UTF-8
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const today = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const filename = `clientes-barbearia-${today}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify(`Planilha exportada com ${allUsers.length} clientes!`);
  }, [notify]);

  const handleDeleteClient = useCallback(
    async (user: AdminUser) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const confirmed = confirm(
        `Tem certeza que deseja excluir o cliente "${user.name}"? Esta acao nao pode ser desfeita.`,
      );
      if (!confirmed) return;

      setIsSubmitting(true);
      try {
        const response = await deleteClient(token, user.id);
        if (!response.ok) {
          notify(response.data.error || "Falha ao excluir cliente.", "error");
          return;
        }

        notify(response.data.message || "Cliente excluido com sucesso!");
        fetchUsers(token);
      } catch {
        notify("Erro ao excluir cliente.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUsers, notify],
  );

  const startRegisterPointsForUser = useCallback((phone: string) => {
    setRegisterPointsForm((previous) => ({ ...previous, phone }));
    setView("POINTS");
  }, []);

  const pageTitle = PAGE_TITLES[view];

  const actions = useMemo(() => ({
    handleLogin,
    handleRegisterClient,
    handleRegisterPoints,
    handleRedeemReward,
    handleLogout,
    handleExportCSV,
    handleDeleteClient,
    startRegisterPointsForUser,
    refreshServices: fetchServices,
  }), [
    handleLogin,
    handleRegisterClient,
    handleRegisterPoints,
    handleRedeemReward,
    handleLogout,
    handleExportCSV,
    handleDeleteClient,
    startRegisterPointsForUser,
    fetchServices
  ]);

  return {
    view,
    setView,
    pageTitle,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    services,
    users: filteredUsers,
    allUsers: users,
    stats,
    toasts,
    registerClientForm,
    setRegisterClientForm,
    registerPointsForm,
    setRegisterPointsForm,
    redeemForm,
    setRedeemForm,
    actions,
  };
}
