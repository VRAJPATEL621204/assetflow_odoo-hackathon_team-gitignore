FROM node:20-slim AS builder

WORKDIR /app

# Accept build-time API URL (injected by docker-compose)
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Production stage — serve with nginx
# ─────────────────────────────────────────
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config — handles SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
