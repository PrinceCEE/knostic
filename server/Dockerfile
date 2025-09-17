FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production=false

COPY tsconfig.json ./
COPY src ./src

# build not strictly needed (tsx runtime), but we can transpile if desired
RUN npx tsc --noEmit --project tsconfig.json

EXPOSE 3000
ENV NODE_ENV=dev
CMD ["npx","tsx","src/index.ts"]