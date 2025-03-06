#!/bin/bash

cd /usr/app/
docker compose down
docker rmi -f $(docker images -aq)