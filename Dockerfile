# syntax=docker/dockerfile:1

# Three images come out of this file:
#   runner  the Next.js standalone server (default target for `docker build .`)
#   migrate a one-shot job that applies the Prisma migrations
# Nothing here needs environment variables at build time.

ARG NODE_VERSION=22.19.0

FROM node:${NODE_VERSION}-slim AS base
# Prisma picks its query engine by looking for OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
# postinstall runs `prisma generate`, which needs the schema.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
