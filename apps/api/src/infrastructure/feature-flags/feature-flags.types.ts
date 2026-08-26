export interface FeatureFlagContext {
  userId?: string;
  tenantId?: string;
  email?: string;
  [key: string]: unknown;
}

export interface FeatureFlagProvider {
  isEnabled(flagKey: string, context?: FeatureFlagContext): boolean | Promise<boolean>;
}
