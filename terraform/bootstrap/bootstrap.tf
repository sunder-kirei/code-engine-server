terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform-state-storage" {
  bucket = "terraform-state-storage-code-engine-server"
}

resource "aws_s3_bucket_versioning" "terraform-state-storage_versioning" {
  bucket = aws_s3_bucket.terraform-state-storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform-state-storage_server_side_encryption_configuration" {
  bucket = aws_s3_bucket.terraform-state-storage.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
