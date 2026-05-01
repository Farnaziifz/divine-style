ARG NODE_IMAGE=node:20-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

ARG NPM_REGISTRY=https://mirror2.chabokan.net/npm/
ARG NPM_REGISTRY_FALLBACK=https://registry.npmjs.org/
ARG NPM_SCOPE=
ARG NPM_SCOPE_REGISTRY=
RUN npm config set registry "${NPM_REGISTRY}" \
  && pnpm config set registry "${NPM_REGISTRY}" \
  && (npm ping --registry "${NPM_REGISTRY}" >/dev/null 2>&1 || (npm config set registry "${NPM_REGISTRY_FALLBACK}" && pnpm config set registry "${NPM_REGISTRY_FALLBACK}")) \
  && if [ -n "${NPM_SCOPE}" ] && [ -n "${NPM_SCOPE_REGISTRY}" ]; then \
    npm config set "${NPM_SCOPE}:registry" "${NPM_SCOPE_REGISTRY}" \
    && pnpm config set "${NPM_SCOPE}:registry" "${NPM_SCOPE_REGISTRY}"; \
  fi

RUN pnpm install --frozen-lockfile

ARG VITE_API_URL=https://api.d-style.ir
ENV VITE_API_URL=$VITE_API_URL

COPY index.html vite.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src

RUN pnpm build

FROM ${NGINX_IMAGE}
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
