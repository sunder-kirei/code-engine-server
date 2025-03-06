#!/bin/bash

cd /usr/app/
sudo docker compose down
sudo docker rmi -f $(docker images -aq)