variable "DATABASE_URL" {
  type      = string
  sensitive = true
}

variable "CRYPTO_ITERATIONS" {
  type      = number
  sensitive = true
}

variable "CRYPTO_KEYLEN" {
  type      = number
  sensitive = true
}

variable "JWT_SECRET" {
  type      = string
  sensitive = true
}
