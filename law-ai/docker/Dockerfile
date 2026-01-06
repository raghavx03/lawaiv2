# Dockerfile for LAW.AI
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
