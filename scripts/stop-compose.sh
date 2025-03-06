#!/bin/bash
if [ -d /usr/app/code-engine-server ]; then
  cd /usr/app/code-engine-server
  docker compose down
  docker rmi -f $(docker images -aq)
fi