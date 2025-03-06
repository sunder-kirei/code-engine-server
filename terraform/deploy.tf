resource "aws_codedeploy_app" "code-engine-server_codedeploy_app" {
  name             = "code-engine-server_codedeploy_app"
  compute_platform = "Server"

  tags = {
    Name = "code-engine-server_codedeploy_app"
  }
}

resource "aws_codedeploy_deployment_group" "code-engine-server_codedeploy_grp" {
  app_name               = aws_codedeploy_app.code-engine-server_codedeploy_app.name
  deployment_group_name  = "code-engine-server_codedeploy_grp"
  service_role_arn       = aws_iam_role.code-engine-server_codedeploy_role.arn
  deployment_config_name = "CodeDeployDefault.OneAtATime"

  ec2_tag_set {
    ec2_tag_filter {
      key   = "Name"
      type  = "KEY_AND_VALUE"
      value = "code-engine-server_instance"
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  tags = {
    Name = "code-engine-server_codedeploy_grp"
  }
}
