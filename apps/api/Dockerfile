# Stage 1: builder
FROM node:20 AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy root package.json and lockfile
COPY package.json pnpm-lock.yaml* ./

# Copy the API app
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --filter api --frozen-lockfile

# Build if needed (e.g., TypeScript)
# RUN pnpm --filter api build

# Stage 2: production
FROM node:20 AS runner

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Copy only what is needed from builder
COPY --from=builder /usr/src/app/apps/api ./apps/api
COPY package.json pnpm-lock.yaml* ./

WORKDIR /usr/src/app/apps/api

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000
CMD ["node", "src/index.js"]