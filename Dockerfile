# Stage 1: Install dependencies
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/email/package.json packages/email/
COPY packages/eslint-config/package.json packages/eslint-config/
RUN pnpm install --frozen-lockfile

# Stage 3: Build shared packages
FROM base AS build-shared
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/email/node_modules ./packages/email/node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/email/ ./packages/email/
COPY tsconfig.base.json ./
RUN pnpm --filter @repo/shared build && pnpm --filter @repo/email build

# Stage 4: Build API
FROM base AS build-api
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY --from=build-shared /app/packages/email/dist ./packages/email/dist
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./
RUN pnpm --filter api build

# Stage 5: Production
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy only what's needed
COPY --from=build-api /app/apps/api/dist ./dist/
COPY --from=build-api /app/apps/api/package.json ./
COPY --from=build-api /app/node_modules ./node_modules/
COPY --from=build-api /app/apps/api/node_modules ./apps/api/node_modules/
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist/
COPY --from=build-shared /app/packages/shared/package.json ./packages/shared/
COPY --from=build-shared /app/packages/email/dist ./packages/email/dist/
COPY --from=build-shared /app/packages/email/package.json ./packages/email/
COPY migrations ./migrations/
COPY scripts/run-migrations.js ./scripts/run-migrations.js

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/live || exit 1

CMD ["node", "dist/main"]
