FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --workspace @sipadi/api

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app/apps/api

COPY --from=dependencies /app/node_modules /app/node_modules
COPY --chown=node:node apps/api ./
RUN mkdir -p uploads && chown node:node uploads

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
