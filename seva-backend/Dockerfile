# ── Stage 1: deps ─────────────────────────────────────────────────────────────
# Install ALL dependencies (including devDependencies) so that the builder stage
# can run the TypeScript compiler (tsc), which is a devDependency.
FROM node:22-alpine AS deps

WORKDIR /app

# Copy lockfile + manifest first so Docker can cache this layer.
# If neither changes, npm ci is skipped on subsequent builds.
COPY package.json package-lock.json ./

# npm ci installs exactly what the lockfile specifies (reproducible builds).
# It also installs devDependencies by default, which we need for `tsc`.
RUN npm ci


# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Compile TypeScript → JavaScript using the project's own tsc (no ts-node at runtime).
FROM node:22-alpine AS builder

WORKDIR /app

# Bring in the full node_modules from deps stage (includes tsc + type defs).
COPY --from=deps /app/node_modules ./node_modules

# Copy TypeScript source and compiler config.
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY src ./src

# Run `tsc` — compiles src/ → dist/ as configured in tsconfig.json
# (rootDir: ./src, outDir: ./dist, target: ES2020, module: commonjs)
RUN npm run build


# ── Stage 3: runner ───────────────────────────────────────────────────────────
# Lean production image: no devDependencies, no TypeScript source.
FROM node:22-alpine AS runner

WORKDIR /app

# NODE_ENV=production tells Node.js (and libraries like mongoose/express)
# to apply production optimisations (e.g. disable stack traces in responses).
ENV NODE_ENV=production

# Copy package files so we can install ONLY production dependencies.
COPY package.json package-lock.json ./

# --omit=dev skips devDependencies (typescript, ts-node-dev, tsx, @types/* …)
# keeping the final image lean.
RUN npm ci --omit=dev

# Copy the compiled JavaScript output from the builder stage.
COPY --from=builder /app/dist ./dist

# Create an uploads directory so multer can write files.
# In a real deployment you would mount a volume here instead.
RUN mkdir -p uploads

# Expose the port the Express server listens on.
# This is documentation only; you still need -p when running the container.
EXPOSE 5000

# Start the compiled server with plain Node — no ts-node, no nodemon.
CMD ["node", "dist/server.js"]