# Stage 1: builder
FROM node:20 AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy everything needed
COPY package.json ./
COPY apps/api ./apps/api

# Install dependencies (simple)
RUN pnpm install --shamefully-hoist

# Stage 2: runner
FROM node:20 AS runner

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Copy API code + node_modules
COPY --from=builder /usr/src/app/apps/api ./apps/api
COPY --from=builder /usr/src/app/node_modules ./node_modules

WORKDIR /usr/src/app/apps/api

EXPOSE 4000
CMD ["node", "src/index.js"]