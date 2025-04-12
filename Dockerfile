FROM node:20.19-alpine as base

RUN apk update && apk add jq make
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN npx prisma generate
RUN pnpm run build

# FROM node:20.19-alpine as prod
# WORKDIR /app

# COPY --from=base /app/dist/ ./dist

EXPOSE 3000

CMD ["node", "--enable-source-maps", "dist/main.js"]
