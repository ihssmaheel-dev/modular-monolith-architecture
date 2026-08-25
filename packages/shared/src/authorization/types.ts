import type { Permission } from "../permissions";

export interface Principal {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantRole?: string;
  department?: string;
  attributes?: Record<string, unknown>;
}

export interface ResourceDescriptor<T = unknown> {
  type: string;
  id?: string;
  tenantId?: string;
  ownerId?: string;
  attributes?: Record<string, unknown>;
  data?: T;
}

export type Relation = "owner" | "editor" | "viewer" | "member" | "admin" | string;

export interface PolicyConditionParams<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>> {
  principal: Principal;
  resource?: ResourceDescriptor<TResource>;
  context?: TContext;
}

export interface Policy<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  description?: string;
  resourceType?: string | string[];
  action: Permission | Permission[] | string | string[];
  effect: "ALLOW" | "DENY";
  priority?: number;
  condition: (params: PolicyConditionParams<TResource, TContext>) => boolean;
}

export interface AuthorizationRequest<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>> {
  principal: Principal;
  action: Permission | string;
  resource?: ResourceDescriptor<TResource> | TResource;
  resourceType?: string;
  context?: TContext;
}

export type AuthorizationDecisionReason =
  | "SUPERADMIN"
  | "RBAC_ROLE"
  | "REBAC_RELATION"
  | "ABAC_POLICY"
  | "DEFAULT_DENY"
  | "EXPLICIT_DENY"
  | "TENANT_MISMATCH";

export interface AuthorizationDecision {
  allowed: boolean;
  reason: AuthorizationDecisionReason;
  matchedPolicyId?: string;
  details?: string;
}
