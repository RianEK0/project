FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY apps/web apps/web
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
ARG NEXT_PUBLIC_AGENCY_NAME="Inspektorat Kota Depok"
ARG NEXT_PUBLIC_SECURITY_CONTACT=
ARG NEXT_PUBLIC_POLICY_APPROVED=false
ARG API_PROXY_TARGET=http://api:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_ORIGIN=$NEXT_PUBLIC_SITE_ORIGIN \
    NEXT_PUBLIC_AGENCY_NAME=$NEXT_PUBLIC_AGENCY_NAME \
    NEXT_PUBLIC_SECURITY_CONTACT=$NEXT_PUBLIC_SECURITY_CONTACT \
    NEXT_PUBLIC_POLICY_APPROVED=$NEXT_PUBLIC_POLICY_APPROVED \
    API_PROXY_TARGET=$API_PROXY_TARGET \
    NODE_ENV=production
RUN npm run build --workspace @sipadi/web

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
