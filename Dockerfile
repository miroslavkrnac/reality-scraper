# PREBUILD
FROM node:22-slim AS build

WORKDIR /usr/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y chromium fonts-liberation libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.build.json ./tsconfig.build.json
COPY ./tsconfig.base.json ./tsconfig.base.json
COPY ./src ./src

RUN yarn install
RUN yarn build

FROM node:22-slim AS production

WORKDIR /usr/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y chromium fonts-liberation libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/package.json ./package.json
COPY --from=build /usr/app/yarn.lock ./yarn.lock

RUN yarn install --production && yarn cache clean

# Increase shared memory size for better browser performance
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

USER 1000:1000
WORKDIR /usr/app/dist
CMD ["node", "main.js"]