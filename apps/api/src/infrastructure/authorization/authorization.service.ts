import { ForbiddenException, Injectable, Optional } from "@nestjs/common";
import {
  evaluateAuthorization,
  type AuthorizationDecision,
  type AuthorizationRequest,
  type Policy,
  type Principal,
} from "@repo/authorization";
import { defaultFoundationalPolicies } from "./policies";
import { PinoLoggerService } from "../logger/logger.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AuthorizationService {
  private readonly policies: Policy[] = [...defaultFoundationalPolicies];

  constructor(
    @Optional() logger?: PinoLoggerService,
    @Optional() private readonly events?: EventEmitter2,
  ) {
    this.logger = logger?.child({ module: "AuthorizationService" });
  }

  private readonly logger?: PinoLoggerService;

  registerPolicies(newPolicies: Policy[]): void {
    this.policies.push(...newPolicies);
  }

  getPolicies(): readonly Policy[] {
    return this.policies;
  }

  check<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>>(
    request: AuthorizationRequest<TResource, TContext>,
  ): AuthorizationDecision {
    const decision = evaluateAuthorization(
      request,
      this.policies as unknown as Policy<TResource, TContext>[],
    );
    this.logger?.debug(
      {
        principalId: request.principal.id,
        action: request.action,
        resourceType: request.resourceType ?? getResourceType(request.resource),
        allowed: decision.allowed,
        reason: decision.reason,
      },
      "Authorization decision",
    );
    if (!decision.allowed && this.events) {
      void this.events
        .emitAsync("authorization.denied", {
          decisionId: crypto.randomUUID(),
          principalId: request.principal.id,
          action: request.action,
          resourceType: request.resourceType ?? getResourceType(request.resource),
          tenantId: request.principal.tenantId,
          reason: decision.reason,
        })
        .catch((error: unknown) => this.logger?.error({ error }, "Authorization audit failed"));
    }
    return decision;
  }

  assert<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>>(
    request: AuthorizationRequest<TResource, TContext>,
  ): AuthorizationDecision {
    const decision = this.check(request);
    if (!decision.allowed) {
      throw new ForbiddenException({
        message: "api.error.forbidden",
        error: decision.reason,
      });
    }
    return decision;
  }

  can(principal: Principal, action: string, resource?: unknown, resourceType?: string): boolean {
    return this.check({ principal, action, resource, resourceType }).allowed;
  }
}

function getResourceType(resource: unknown): string | undefined {
  if (typeof resource !== "object" || resource === null) return undefined;
  const type = (resource as Record<string, unknown>).type;
  return typeof type === "string" ? type : undefined;
}
