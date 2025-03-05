FROM node:20.17.0 AS base

WORKDIR /usr/lib
RUN apt-get update -y
RUN apt-get install libcap-dev asciidoc-base -y
RUN git clone https://github.com/ioi/isolate.git
WORKDIR /usr/lib/isolate
RUN apt-get install -y libsystemd-dev build-essential
RUN make
RUN make install
RUN apt install -y python3

WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/usr/cache/.npm \
    npm set cache /usr/cache/.npm

FROM base AS development

RUN npm install
COPY . .
CMD npm run dev

FROM base AS production

RUN npm install
COPY . .
RUN npm run build
CMD npm run start