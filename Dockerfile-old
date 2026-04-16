ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

ARG NPM_REGISTRY=https://mirror2.chabokan.net/npm/
RUN npm config set registry ${NPM_REGISTRY}

RUN corepack enable
RUN pnpm install --frozen-lockfile

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY index.html vite.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src
RUN pnpm build

FROM ${NGINX_IMAGE}
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
