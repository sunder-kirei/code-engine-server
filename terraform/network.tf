resource "aws_vpc" "code-engine-server_vpc" {
  cidr_block = "10.0.0.0/24"

  tags = {
    Name = "code-engine-server_vpc"
  }
}

resource "aws_subnet" "code-engine-server_subnet" {
  vpc_id                  = aws_vpc.code-engine-server_vpc.id
  cidr_block              = "10.0.0.0/24"
  map_public_ip_on_launch = true
  depends_on              = [aws_vpc.code-engine-server_vpc]
  tags = {
    Name = "code-engine-server_subnet"
  }
}

resource "aws_internet_gateway" "code-engine-server_internet_gateway" {
  vpc_id = aws_vpc.code-engine-server_vpc.id
  tags = {
    Name = "code-engine-server_internet_gateway"
  }
}

resource "aws_route_table" "code-engine-server_route_table" {
  vpc_id = aws_vpc.code-engine-server_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.code-engine-server_internet_gateway.id
  }

  tags = {
    Name = "code-engine-server_route_table"
  }
}

resource "aws_route_table_association" "code-engine-server_route_table_association" {
  subnet_id      = aws_subnet.code-engine-server_subnet.id
  route_table_id = aws_route_table.code-engine-server_route_table.id
}

resource "aws_security_group" "code-engine-server_security_group" {
  name   = "code-engine-server_security_group"
  vpc_id = aws_vpc.code-engine-server_vpc.id

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "code-engine-server_security_group"
  }
}
