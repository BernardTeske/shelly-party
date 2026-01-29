# Build-Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Installiere Yarn
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

# Erstelle .yarnrc.yml um node_modules zu verwenden (PnP deaktivieren)
RUN echo "nodeLinker: node-modules" > .yarnrc.yml

# Kopiere Package-Dateien
COPY package.json yarn.lock ./
COPY tsconfig.json ./

# Installiere alle Dependencies (inkl. DevDependencies für Build)
RUN yarn install --frozen-lockfile

# Kopiere Source-Code
COPY src ./src

# Build TypeScript
RUN yarn build

# Installiere nur Production-Dependencies für späteres Kopieren
RUN yarn install --production --frozen-lockfile --force

# Production-Stage
FROM node:20-alpine

WORKDIR /app

# Kopiere Package-Dateien
COPY package.json ./

# Kopiere Production node_modules vom Builder
COPY --from=builder /app/node_modules ./node_modules

# Kopiere .yarnrc.yml vom Builder
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml

# Kopiere gebauten Code und Programme
COPY --from=builder /app/dist ./dist
COPY programmes ./programmes

# Exponiere Port
EXPOSE 3000

# Starte die App
CMD ["node", "dist/index.js"]

