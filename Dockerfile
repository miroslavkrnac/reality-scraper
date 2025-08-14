# PREBUILD
FROM node:22-slim AS build

WORKDIR /usr/app

# @NOTE: Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# @NOTE: Install system dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y chromium fonts-liberation libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# @NOTE: Copy package files
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
COPY ./next.config.js ./next.config.js
COPY ./vitest.config.ts ./vitest.config.ts
COPY ./biome.jsonc ./biome.jsonc

# @NOTE: Copy source code
COPY ./src ./src
COPY ./prisma ./prisma
COPY ./cron.js ./cron.js
COPY ./public ./public

# @NOTE: Install dependencies and build
RUN yarn install
RUN yarn build
RUN yarn db:generate

# PRODUCTION
FROM node:22-slim AS production

WORKDIR /usr/app

# @NOTE: Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

# @NOTE: Install system dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y chromium fonts-liberation libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# @NOTE: Copy built application
COPY --from=build /usr/app/.next ./.next
COPY --from=build /usr/app/public ./public
COPY --from=build /usr/app/package.json ./package.json
COPY --from=build /usr/app/yarn.lock ./yarn.lock
COPY --from=build /usr/app/next.config.js ./next.config.js
COPY --from=build /usr/app/prisma ./prisma
COPY --from=build /usr/app/cron.js ./cron.js

# @NOTE: Install production dependencies
RUN yarn install --production && yarn cache clean

# @NOTE: Generate Prisma client for production
RUN yarn db:generate

# @NOTE: Increase shared memory size for better browser performance
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

# @NOTE: Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /usr/app
USER appuser

# @NOTE: Expose port for Next.js
EXPOSE 3000

# @NOTE: Start both Next.js app and cron job
CMD ["sh", "-c", "yarn start & node cron.js & wait"]