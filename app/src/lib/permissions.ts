import type { UserRole } from "./types";

const ROLE_ORDER: Record<UserRole, number> = {
  cajero: 1,
  administrador: 2,
  dueño: 3,
};

export function hasPermission(role: UserRole | undefined | null, required: UserRole): boolean {
  if (!role) return false;
  return ROLE_ORDER[role] >= ROLE_ORDER[required];
}

export function canAccess(role: UserRole | undefined | null, allowed: UserRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export const PERMISSIONS = {
  VIEW_COSTS: ["administrador", "dueño"] as UserRole[],
  MANAGE_PRODUCTS: ["administrador", "dueño"] as UserRole[],
  MANAGE_USERS: ["dueño"] as UserRole[],
  VOID_SALE: ["administrador", "dueño"] as UserRole[],
  CLOSE_CASH: ["administrador", "dueño"] as UserRole[],
  VIEW_REPORTS: ["administrador", "dueño"] as UserRole[],
  MANAGE_SETTINGS: ["dueño"] as UserRole[],
};
