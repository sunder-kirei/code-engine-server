resource "aws_eip" "code-engine-server_eip" {
  instance = aws_instance.code-engine-server_instance.id
  domain   = "vpc"

  depends_on = [aws_internet_gateway.code-engine-server_internet_gateway]
}
