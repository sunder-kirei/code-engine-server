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

FROM node:20.17.0-slim AS production

WORKDIR /usr/app
COPY package.json package-lock.json ./

# Binary
COPY --from=base /usr/local/bin/isolate /usr/local/bin/isolate
# Config
COPY --from=base /usr/local/etc/isolate /usr/local/etc/isolate
# Box
COPY --from=base /var/local/lib/isolate /var/local/lib/isolate
RUN apt-get update
RUN apt-get install -y libcap-dev build-essential
RUN apt install -y python3

RUN npm install
COPY . .
RUN npm run build
CMD npm run start