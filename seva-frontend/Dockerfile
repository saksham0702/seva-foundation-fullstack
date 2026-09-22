# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 1. Accept the build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMAGE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

# 2. Convert them into environment variables for the Next.js build process
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMAGE_URL=$NEXT_PUBLIC_IMAGE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy minimal standalone build output and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]