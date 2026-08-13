# EventSync Frontend — multi-stage build

# 1) Build the Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Vite bakes env vars at build time.
ARG VITE_API_URL=http://localhost:5050/api
ARG VITE_SOCKET_URL=http://localhost:5050
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
