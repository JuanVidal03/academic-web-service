# ---------- Stage 1: build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Habilita pnpm segun la version declarada en package.json
RUN corepack enable

# Instala dependencias (capa cacheable)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copia el resto del codigo
COPY . .

# Variable de build: Vite la inyecta en el bundle en tiempo de compilacion.
# En Render se define como Environment Variable del servicio (tipo Docker -> Build arg)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runner

# Config de nginx como template: envsubst reemplaza ${PORT} al arrancar
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# Archivos estaticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Render inyecta PORT; este es el valor por defecto en local
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
