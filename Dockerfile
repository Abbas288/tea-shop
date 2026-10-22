FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/* \
    && git config --global url."https://github.com/".insteadOf ssh://git@github.com/ \
    && git config --global --add url."https://github.com/".insteadOf git@github.com:

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim AS production

WORKDIR /app
ENV NODE_ENV=production

LABEL org.opencontainers.image.source="https://github.com/Abbas288/tea-shop"

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD node --input-type=module -e "const response = await fetch('http://127.0.0.1:3000/api/products', { signal: AbortSignal.timeout(4000) }); if (!response.ok) process.exit(1)"

CMD ["node", "src/server.js"]
