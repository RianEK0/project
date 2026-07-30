FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY . .

EXPOSE 3000

