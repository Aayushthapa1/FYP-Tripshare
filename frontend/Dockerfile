# ────────── Build Stage ──────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ────────── Serve Stage ──────────
FROM node:20-alpine

RUN npm install -g serve
WORKDIR /app

# ⛳ Fix this line to use Vite's "dist" output folder
COPY --from=build /app/dist /app/dist

EXPOSE 80

# ⛳ Also change serve target from "build" to "dist"
CMD ["serve", "-s", "dist", "-l", "80"]
