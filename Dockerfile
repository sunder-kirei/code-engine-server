FROM node:20.17.0

RUN apt-get update
RUN apt-get install -y openjdk-17-jdk tar wget supervisor
RUN wget https://dlcdn.apache.org/kafka/3.9.0/kafka_2.12-3.9.0.tgz
RUN mkdir /usr/kafka
RUN tar -xzf kafka_2.12-3.9.0.tgz -C /usr/kafka

COPY supervisord.conf /usr/app/supervisord.conf

# RUN KAFKA
ENV KAFKA_BROKER_ID=1
ENV KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT,CONTROLLER:PLAINTEXT
ENV KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
ENV KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
ENV KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0
ENV KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1
ENV KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
ENV KAFKA_PROCESS_ROLES=broker,controller
ENV KAFKA_NODE_ID=1
ENV KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:29093
ENV KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:29092,CONTROLLER://kafka:29093,PLAINTEXT_HOST://0.0.0.0:9092
ENV KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
ENV KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
ENV KAFKA_LOG_DIRS=/tmp/kraft-combined-logs
ENV KAFKA_NUM_PARTITIONS=3
ENV KAFKA_CLUSTER_ID=unique-cluster-id

RUN /usr/kafka/kafka_2.12-3.9.0/bin/kafka-storage.sh format --standalone -t $KAFKA_CLUSTER_ID -c /usr/kafka/kafka_2.12-3.9.0/config/kraft/reconfig-server.properties

# RUN REDIS
RUN apt-get install -y lsb-release curl gpg
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
RUN apt-get update
RUN apt-get install -y redis

# RUN CODE ENGINE WORKER
WORKDIR /usr/lib
RUN apt-get update -y
RUN apt-get install libcap-dev asciidoc-base -y
RUN git clone https://github.com/ioi/isolate.git
WORKDIR /usr/lib/isolate
RUN apt-get install -y libsystemd-dev build-essential
RUN make
RUN make install
RUN apt install -y python3

WORKDIR /usr/app/worker
COPY worker/package.json worker/package-lock.json ./
RUN --mount=type=cache,target=/usr/cache/.npm \
    npm set cache /usr/cache/.npm

ENV KAFKA_CLIENT_ID=code-engine-worker-1
ENV KAFKA_BROKERS=localhost:9092

RUN npm install
COPY worker .
RUN npm run build

# RUN CODE ENGINE SERVER
WORKDIR /usr/app/server
COPY server/package.json server/package-lock.json server/prisma ./
RUN --mount=type=cache,target=/usr/cache/.npm \
    npm set cache /usr/cache/.npm
EXPOSE 3000

ENV KAFKA_CLIENT_ID=code-engine-server
ENV KAFKA_BROKERS=localhost:9092
ENV REDIS_URL=redis://localhost:6379

RUN npm install
COPY server .
RUN npm run build
CMD /usr/bin/supervisord -c /usr/app/supervisord.conf