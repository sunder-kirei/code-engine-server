#!/bin/bash

docker compose down
docker rmi -f $(docker images -aq)