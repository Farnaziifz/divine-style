# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set registry https://mirror2.chabokan.net/npm/

RUN npm i

COPY . .

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

RUN npm run build \
  && npx esbuild server.ts \
    --bundle \
    --platform=node \
    --format=esm \
    --packages=external \
    --outfile=server.mjs

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm config set registry https://mirror2.chabokan.net/npm/ \
  && npm install --omit=dev

COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/dist ./dist

EXPOSE 3000

