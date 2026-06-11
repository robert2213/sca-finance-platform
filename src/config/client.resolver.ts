// Central client resolution layer (Sprint 10 Phase A).
//
// Every code path that needs a tenant ID resolves it here instead of
// hardcoding "demo-client". Until an auth layer lands (Sprint 3 / Clerk),
// resolution always falls back to the default client in client.config.ts —
// when sessions carry a real tenant ID, this file is the only place that
// needs to learn about it.

import defaultConfig, { type ClientEnvironment } from "./client.config";

/** The active client identity. */
export interface ResolvedClient {
  id: string;
  name: string;
  environment: ClientEnvironment;
}

/**
 * Default tenant ID — sourced from client.config.ts, never hardcoded
 * elsewhere. Use as the default value for `clientId` parameters.
 */
export const DEFAULT_CLIENT_ID = defaultConfig.clientId;

/**
 * Resolve the active tenant ID. An explicit ID (e.g. from a future
 * session/auth layer or a request param) wins; otherwise the default client.
 */
export function resolveClientId(explicitClientId?: string | null): string {
  const trimmed = explicitClientId?.trim();
  return trimmed ? trimmed : DEFAULT_CLIENT_ID;
}

/** Resolve the full client identity (id, display name, environment). */
export function resolveClient(explicitClientId?: string | null): ResolvedClient {
  const id = resolveClientId(explicitClientId);
  if (id === defaultConfig.clientId) {
    return {
      id,
      name: defaultConfig.clientName,
      environment: defaultConfig.environment,
    };
  }
  // Non-default tenants have no config registry yet (Sprint 3+): surface the
  // ID as the name rather than mislabeling them as the demo client.
  return { id, name: id, environment: defaultConfig.environment };
}
