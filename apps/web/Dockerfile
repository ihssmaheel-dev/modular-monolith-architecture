FROM node:22.12.0-alpine AS base

# Stage 1: Builder (Prune workspace)
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm install turbo --global
COPY . .
RUN turbo prune web --docker

# Stage 2: Installer
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

# Install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
# Ensure environment variables are passed during build if needed
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm turbo build --filter=web...

# Stage 3: Runner (Nginx)
FROM nginx:alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from installer stage
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
