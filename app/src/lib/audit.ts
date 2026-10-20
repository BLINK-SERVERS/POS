import type { AuditLogEntry } from "./types";

const AUDIT_KEY = "blink-audit-logs-v1";

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "at">): void {
  try {
    const logs = getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newEntry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 500)));
  } catch {
    // ignore
  }
}
