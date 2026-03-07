import type { MenuItem, Product, Reward } from "./types";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const isLocalBrowser =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
export const API_BASE_URL = envBaseUrl
  ? envBaseUrl.replace(/\/$/, "")
  : isLocalBrowser
    ? "http://localhost:3001"
    : "";

export const REWARDS: Reward[] = [
  { id: "agua", name: "1 Agua", cost: 40 },
  { id: "refrigerante", name: "1 Refrigerante", cost: 60 },
  { id: "cerveja", name: "1 Cerveja", cost: 80 },
  { id: "desconto5", name: "Desconto R$5", cost: 100 },
  { id: "sobrancelha_gift", name: "Sobrancelha", cost: 120 },
  { id: "barba_gift", name: "Barba", cost: 150 },
  { id: "lavagem_gift", name: "Lavagem Capilar", cost: 150 },
  { id: "2cervejas", name: "2 Cervejas", cost: 160 },
  { id: "hidra_gift", name: "Hidratacao Capilar", cost: 220 },
  { id: "corte_gift", name: "Corte de Cabelo", cost: 300 },
  { id: "combo_gift", name: "Corte + Barba", cost: 450 },
  { id: "vip_gift", name: "Corte VIP (Completo)", cost: 600 },
];

export const DEFAULT_SERVICES: Product[] = [
  { id: "default-corte", name: "Corte de Cabelo", price: 40, pointsAward: 10 },
  { id: "default-barba", name: "Barba", price: 25, pointsAward: 10 },
  { id: "default-combo", name: "Combo (Corte + Barba)", price: 60, pointsAward: 20 },
  { id: "default-sobrancelha", name: "Sobrancelha", price: 20, pointsAward: 5 },
  { id: "default-lavagem", name: "Lavagem Capilar", price: 20, pointsAward: 5 },
  { id: "default-hidratacao", name: "Hidratacao Capilar", price: 45, pointsAward: 10 },
  { id: "default-corte-vip", name: "Corte VIP (Completo)", price: 90, pointsAward: 20 },
];

export const PRODUCT_TERMS = ["agua", "cerveja", "refrigerante"];

export const MENU_ITEMS: MenuItem[] = [
  { id: "DASHBOARD", label: "Painel", icon: "trend" },
  { id: "POINTS", label: "Registrar Atendimento", icon: "plus" },
  { id: "REGISTER", label: "Cadastrar Cliente", icon: "users" },
  { id: "REDEEM", label: "Resgatar Recompensa", icon: "gift" },
  { id: "SERVICES", label: "Tabela de Servicos", icon: "table" },
];

export const PAGE_TITLES = {
  LOADING: "Sincronizando",
  LANDING: "BarberPoints",
  LOGIN: "Login administrativo",
  DASHBOARD: "Visao geral",
  POINTS: "Registrar atendimento",
  REGISTER: "Cadastrar cliente",
  REDEEM: "Resgatar recompensa",
  SERVICES: "Tabela de servicos",
} as const;
