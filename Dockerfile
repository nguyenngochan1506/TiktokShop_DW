# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Cài thêm openssl ở đây để npm install có thể compile nếu cần
RUN apk add --no-cache libc6-compat python3 make g++ openssl

COPY package.json package-lock.json* .npmrc* ./
RUN npm install --legacy-peer-deps

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Lúc này nó sẽ tạo ra binary cho linux-musl-openssl-3.0.x nhờ file schema đã sửa)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production image (RUNNER)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# --- FIX LỖI PRISMA TẠI ĐÂY ---
# Cài đặt openssl để Prisma có thể load thư viện libssl
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]