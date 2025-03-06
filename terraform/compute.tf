resource "aws_instance" "code-engine-server_instance" {
  ami                         = "ami-0e1bed4f06a3b463d"
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.code-engine-server_subnet.id
  vpc_security_group_ids      = [aws_security_group.code-engine-server_security_group.id]
  associate_public_ip_address = true

  user_data_base64 = base64encode("${templatefile("init.sh", {
    DATABASE_URL      = var.DATABASE_URL,
    CRYPTO_ITERATIONS = var.CRYPTO_ITERATIONS,
    CRYPTO_KEYLEN     = var.CRYPTO_KEYLEN,
    JWT_SECRET        = var.JWT_SECRET
  })}")

  availability_zone = "us-east-1"

  depends_on = [
    aws_internet_gateway.code-engine-server_internet_gateway,
    aws_route_table.code-engine-server_route_table,
    aws_route_table_association.code-engine-server_route_table_association,
    aws_security_group.code-engine-server_security_group,
    aws_subnet.code-engine-server_subnet,
    aws_vpc.code-engine-server_vpc
  ]
  tags = {
    Name = "code-engine-server_instance"
  }
}
