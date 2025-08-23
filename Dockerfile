# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# @NOTE: Install system dependencies for Puppeteer and Prisma
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    openssl

# @NOTE: Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN yarn --frozen-lockfile

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# @NOTE: Generate Prisma client
RUN yarn db:generate

# This will do the trick, use the corresponding env file for each environment.
# COPY .env.production.sample .env.production
RUN yarn build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# @NOTE: Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# @NOTE: Copy Prisma and cron files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/cron.js ./cron.js

# @NOTE: Generate Prisma client in production stage
RUN yarn db:generate

# @NOTE: Increase shared memory size for better browser performance
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

USER nextjs

EXPOSE 3005

ENV PORT=3005

# @NOTE: Start both Next.js app and cron job
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js & node cron.js & wait"]