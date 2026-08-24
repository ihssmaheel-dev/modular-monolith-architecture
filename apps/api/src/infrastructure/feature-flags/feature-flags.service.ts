import { Injectable } from "@nestjs/common";
import { PinoLoggerService } from "../logger/logger.service";
import type { FeatureFlagContext, FeatureFlagProvider } from "./feature-flags.types";

@Injectable()
export class FeatureFlagsService implements FeatureFlagProvider {
  private readonly flags = new Map<string, boolean>();

  constructor(private readonly logger: PinoLoggerService) {
    this.logger = logger.child({ module: "FeatureFlagsService" });
  }

  isEnabled(flagKey: string, context?: FeatureFlagContext): boolean {
    // 1. Check in-memory override
    if (this.flags.has(flagKey)) {
      const enabled = Boolean(this.flags.get(flagKey));
      this.logger.debug({ flagKey, enabled, context }, "Evaluated feature flag from memory");
      return enabled;
    }

    // 2. Check process environment variable: FEATURE_FLAG_<KEY> (e.g. FEATURE_FLAG_NEW_BILLING=true)
    const envKey = `FEATURE_FLAG_${flagKey.toUpperCase().replace(/-/g, "_")}`;
    const envVal = process.env[envKey];
    if (envVal !== undefined) {
      const enabled = envVal.toLowerCase() === "true" || envVal === "1";
      this.logger.debug({ flagKey, envKey, enabled, context }, "Evaluated feature flag from env");
      return enabled;
    }

    // Default to false for unknown flags
    return false;
  }

  setFlag(flagKey: string, enabled: boolean): void {
    this.flags.set(flagKey, enabled);
    this.logger.info({ flagKey, enabled }, "Feature flag override updated");
  }

  deleteFlag(flagKey: string): void {
    this.flags.delete(flagKey);
  }

  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [key, value] of this.flags.entries()) {
      result[key] = value;
    }
    return result;
  }
}
