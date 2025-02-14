FROM node:20.17.0 AS base

WORKDIR /usr/app
COPY package.json package-lock.json prisma ./
RUN --mount=type=cache,target=/usr/cache/.npm \
    npm set cache /usr/cache/.npm
EXPOSE 3000

FROM base AS development

RUN npm install
COPY . .
CMD npm run dev

FROM base AS production

RUN npm install --production
COPY . .
CMD npm run start