import { API_BASE_URL } from "../constants";
import type { AdminUser, Product } from "../types";

type ApiResponse<T> = {
  ok: boolean;
  data: T;
};

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const data = (await response.json()) as T;
  return { ok: response.ok, data };
}

export async function getProducts(): Promise<ApiResponse<unknown>> {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return parseJson<unknown>(response);
}

export async function loginAdmin(): Promise<ApiResponse<{ token?: string; error?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, { method: "POST" });
  return parseJson<{ token?: string; error?: string }>(response);
}

export async function getAdminUsers(token: string): Promise<ApiResponse<AdminUser[] | { error?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<AdminUser[] | { error?: string }>(response);
}

export async function registerClient(
  token: string,
  payload: { name: string; phone: string },
): Promise<ApiResponse<{ error?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/register-client`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parseJson<{ error?: string }>(response);
}

export async function addPoints(
  token: string,
  payload: { targetPhone: string; amountSpent: number; pointsEarned: number; description: string },
): Promise<ApiResponse<{ error?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/add-points`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parseJson<{ error?: string }>(response);
}

export async function redeemReward(
  token: string,
  payload: { targetPhone: string; pointsCost: number; description: string },
): Promise<ApiResponse<{ error?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/redeem-reward`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parseJson<{ error?: string }>(response);
}

export async function deleteClient(
  token: string,
  userId: string,
): Promise<ApiResponse<{ error?: string; message?: string }>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ error?: string; message?: string }>(response);
}

export function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value);
}
