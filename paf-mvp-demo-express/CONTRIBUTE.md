# Prebid Addressability Framework (PAF): contribute to demo

Start with [root contribute file](../CONTRIBUTE.md)

## Add a new vhost

1. create a new configuration file in `/src`
2. add it in [index.ts](./src/index.ts)
3. add the new configuration in [fake-hosts.ts](./scripts/fake-hosts.ts)
4. generate an EC private key
   1. For example: `openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem`
   2. copy its content to the config file, as `privateKey`
5. generate the corresponding EC public key
   1. For example: `openssl ec -in private-key.pem -pubout -out public-key.pem`
   2. copy its content to the config file, as `publicKey`
6. re-generate the SSL certificate (see [README.md](README.md))
