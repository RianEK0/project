FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate

FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001
ENV DATABASE_URL=file:./dev.db

COPY --from=backend-builder /app/backend /app/backend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

RUN mkdir -p /app/backend/uploads /app/backend/prisma

EXPOSE 5001

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
