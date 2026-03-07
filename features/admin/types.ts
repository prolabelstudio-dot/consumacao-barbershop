export type AppView =
  | "LOADING"
  | "LANDING"
  | "LOGIN"
  | "DASHBOARD"
  | "POINTS"
  | "REGISTER"
  | "REDEEM"
  | "SERVICES";

export type Product = {
  id: string;
  name: string;
  price: number;
  pointsAward: number;
  category?: string;
};

export type Reward = {
  id: string;
  name: string;
  cost: number;
};

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  totalPoints: number;
  currentTier?: string;
  _count?: { transactions?: number };
};

export type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

export type AdminStats = {
  clients: number;
  visits: number;
};

export type MenuItem = {
  id: Exclude<AppView, "LOADING" | "LANDING" | "LOGIN">;
  label: string;
  icon: "trend" | "plus" | "users" | "gift" | "table";
};
