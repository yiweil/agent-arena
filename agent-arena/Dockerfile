FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install dependencies needed for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Create data directory
RUN mkdir -p ./data && chown nextjs:nodejs ./data

# Prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output (includes server.js and traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy init script and its dependencies
# The standalone trace includes better-sqlite3 since it's used in API routes,
# but uuid may not be traced. Copy it explicitly from deps.
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/uuid ./node_modules/uuid

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node scripts/init-db.js && node server.js"]
