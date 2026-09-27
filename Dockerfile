# Built and run by vps-infrastructure (apps.yaml): a static build served by nginx on port 80, behind Traefik.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# Echo models (ADR 0004): downloaded from this repo's GitHub Release at pinned checksums, in their own layer so
# Docker reuses them until the pins change. Learners then download them from this server, never from GitHub.
COPY src/echo/models.ts src/echo/models.ts
COPY scripts/echo-models.ts scripts/echo-models.ts
RUN node scripts/echo-models.ts
COPY . .
RUN npm run catalog:check && npm run audio:check && npm run echo:check && npm test && npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
