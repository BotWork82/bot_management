# --- ÉTAPE 1 : Installation des dépendances ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# --- ÉTAPE 2 : Construction du projet ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# --- ÉTAPE 3 : Runner (Serveur Node) ---
FROM node:20-alpine AS runner
WORKDIR /app

# On installe 'serve' pour distribuer les fichiers statiques
RUN npm install -g serve

# On récupère uniquement le dossier buildé (dist)
COPY --from=builder /app/dist ./dist

# Sécurité : on crée un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vitejs
USER vitejs

# On expose le port 3588
EXPOSE 3588

CMD ["serve", "-s", "dist", "-l", "3588"]