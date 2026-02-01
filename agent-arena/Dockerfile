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
# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
# Required for better-sqlite3 native addon
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Create data directory
RUN mkdir ./data && chown nextjs:nodejs ./data

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database initialization script
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start as root to fix volume permissions, then drop to nextjs
CMD ["sh", "-c", "chown -R nextjs:nodejs /app/data 2>/dev/null; su nextjs -s /bin/sh -c 'node scripts/init-db.js && node server.js'"]