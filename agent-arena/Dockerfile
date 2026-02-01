FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install dependencies needed for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
# Required for better-sqlite3 native addon
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy application files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p ./data && chown nextjs:nodejs ./data

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start as root to fix volume permissions, then drop to nextjs
CMD ["sh", "-c", "chown -R nextjs:nodejs /app/data 2>/dev/null; su nextjs -s /bin/sh -c 'node scripts/init-db.js && npx next start -p 3000 -H 0.0.0.0'"]
