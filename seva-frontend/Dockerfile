# ── Stage 1: deps ─────────────────────────────────────────────────────────────
# Install ALL dependencies (including devDependencies like typescript, eslint)
# that `next build` requires at compile time.
FROM node:22-alpine AS deps

WORKDIR /app

# Copy lockfile + manifest first for better layer caching.
COPY package.json package-lock.json ./

# npm ci installs exactly what package-lock.json specifies (reproducible).
# devDependencies are needed here because next build uses TypeScript + tailwind.
RUN npm ci


# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Run `next build`. With output: 'standalone' in next.config.ts, Next.js emits
# .next/standalone — a self-contained server.js + traced node_modules.
FROM node:22-alpine AS builder

WORKDIR /app

# Bring in all node_modules from deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire source tree (src/, public/, config files, etc.).
COPY . .

# Runs `next build` which compiles pages, optimises assets, and (because
# output: 'standalone' is set) produces .next/standalone/server.js.
# NEXT_TELEMETRY_DISABLED suppresses the telemetry prompt during CI builds.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# ── Stage 3: runner ───────────────────────────────────────────────────────────
# Final image contains only what is needed to serve the app at runtime:
# - .next/standalone  → self-contained Node server + minimal node_modules
# - .next/static      → hashed JS/CSS chunks served by the built-in server
# - public/           → static files served as-is (images, fonts, etc.)
FROM node:22-alpine AS runner

WORKDIR /app

# Disable telemetry in production as well.
ENV NEXT_TELEMETRY_DISABLED=1

# NODE_ENV=production enables React's production build and Next.js optimisations.
ENV NODE_ENV=production

# The standalone output already contains a minimal node_modules trace,
# so we do NOT run npm install here.
COPY --from=builder /app/.next/standalone ./

# Static assets (.next/static) must be nested inside the working directory
# exactly at .next/static so server.js can resolve them.
COPY --from=builder /app/.next/static ./.next/static

# Public directory (favicon, og images, etc.) must sit beside server.js.
COPY --from=builder /app/public ./public

# Document the port Next.js listens on (default 3000).
EXPOSE 3000

# server.js is the entry point emitted by Next.js standalone output.
# It starts an HTTP server on the port from the PORT env var (default 3000).
CMD ["node", "server.js"]