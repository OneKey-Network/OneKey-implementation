# Prebid Addressability Framework (PAF): contribute to demo

Start with [root contribute file](../CONTRIBUTE.md)

## Add a vhost

1. create a new configuration file in `/src`
2. generate an EC private key
   1. For example: `openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem`
   2. copy its content to the config file, as `privateKey`
2. generate the corresponding EC public key
   1. For example: `openssl ec -in private-key.pem -pubout -out public-key.pem`
   2. copy its content to the config file, as `publicKey`
