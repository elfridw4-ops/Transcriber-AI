FROM node:20-alpine

# Installation de FFmpeg (Indispensable pour l'extraction audio)
RUN apk add --no-cache ffmpeg

# Définition du dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Construction du frontend (React/Vite)
RUN npm run build

# Création des dossiers nécessaires pour le backend
RUN mkdir -p uploads outputs

# Exposition du port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrage du serveur Node.js
CMD ["npx", "tsx", "server.ts"]
