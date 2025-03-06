data "aws_iam_policy_document" "code-engine-server_codedeploy_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codedeploy.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "code-engine-server_codedeploy_role" {
  name               = "code-engine-server_codedeploy_role"
  assume_role_policy = data.aws_iam_policy_document.code-engine-server_codedeploy_assume_role.json

  tags = {
    Name = "code-engine-server_codedeploy_role"
  }
}

resource "aws_iam_role_policy_attachment" "code-engine-server_codedeploy_role_policy_attachment" {
  role       = aws_iam_role.code-engine-server_codedeploy_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_iam_role" "code-engine-server_codedeploy_ec2_role" {
  name = "code-engine-server_codedeploy_ec2_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "code-engine-server_codedeploy_ec2_role"
  }
}

resource "aws_iam_role_policy_attachment" "code-engine-server_codedeploy_ec2_role_policy_attachment" {
  role       = aws_iam_role.code-engine-server_codedeploy_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforAWSCodeDeploy"

}

resource "aws_iam_instance_profile" "code-engine-server_codedeploy_ec2_instance_profile" {
  name = "code-engine-server_codedeploy_ec2_instance_profile"
  role = aws_iam_role.code-engine-server_codedeploy_ec2_role.name
}
