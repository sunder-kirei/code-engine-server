#!/bin/bash
# install docker and docker-compose

# Add Docker's official GPG key:
apt-get update
apt-get -y install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update

apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
groupadd docker
usermod -aG docker ubuntu
newgrp docker

apt install -y ruby-full
apt install -y wget
cd /home/ubuntu
wget https://aws-codedeploy-ap-south-1.s3.ap-south-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent

mkdir -p /usr/app/
cd /usr/app/

echo CRYPTO_ITERATIONS=${CRYPTO_ITERATIONS} >> ./.env
echo CRYPTO_KEYLEN=${CRYPTO_KEYLEN} >> ./.env
echo JWT_SECRET="${JWT_SECRET}" >> ./.env
echo DATABASE_URL="${DATABASE_URL}" >> ./.env