data "aws_iam_policy" "code-engine-server_codedeploy_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"

  tags = {
    Name = "code-engine-server_codedeploy_policy"
  }
}

resource "aws_iam_role" "code-engine-server_codedeploy_role" {
  name               = "code-engine-server_codedeploy_role"
  assume_role_policy = data.aws_iam_policy.code-engine-server_codedeploy_policy.json

  tags = {
    Name = "code-engine-server_codedeploy_role"
  }
}
