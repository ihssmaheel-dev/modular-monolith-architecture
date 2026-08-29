import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  evaluateAuthorization,
  type AuthorizationDecision,
  type AuthorizationRequest,
  type Policy,
  type Principal,
} from "@repo/authorization";
import { defaultFoundationalPolicies } from "./policies";

@Injectable()
export class AuthorizationService {
  private readonly policies: Policy[] = [...defaultFoundationalPolicies];

  registerPolicies(newPolicies: Policy[]): void {
    this.policies.push(...newPolicies);
  }

  getPolicies(): readonly Policy[] {
    return this.policies;
  }

  check<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>>(
    request: AuthorizationRequest<TResource, TContext>,
  ): AuthorizationDecision {
    return evaluateAuthorization(
      request,
      this.policies as unknown as Policy<TResource, TContext>[],
    );
  }

  assert<TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>>(
    request: AuthorizationRequest<TResource, TContext>,
  ): AuthorizationDecision {
    const decision = this.check(request);
    if (!decision.allowed) {
      throw new ForbiddenException(decision.details ?? `Authorization denied: ${decision.reason}`);
    }
    return decision;
  }

  can(principal: Principal, action: string, resource?: unknown, resourceType?: string): boolean {
    return this.check({ principal, action, resource, resourceType }).allowed;
  }
}
