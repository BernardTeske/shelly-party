# Build-Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Installiere Yarn
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

# Kopiere Package-Dateien
COPY package.json yarn.lock ./
COPY tsconfig.json ./

# Installiere Dependencies
RUN yarn install --frozen-lockfile

# Kopiere Source-Code
COPY src ./src

# Build TypeScript
RUN yarn build

# Production-Stage
FROM node:20-alpine

WORKDIR /app

# Installiere Yarn
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

# Kopiere Package-Dateien
COPY package.json yarn.lock ./

# Installiere nur Production-Dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Kopiere gebauten Code und Programme
COPY --from=builder /app/dist ./dist
COPY programmes ./programmes

# Exponiere Port
EXPOSE 3000

# Starte die App
CMD ["node", "dist/index.js"]

