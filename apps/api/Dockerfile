# Stage 1 - deps install
FROM node:20 AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod=false

COPY . .

# Stage 2 - production image
FROM node:20 AS runner

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod=true

COPY --from=builder /usr/src/app/src ./src

EXPOSE 4000

CMD ["pnpm", "start"]