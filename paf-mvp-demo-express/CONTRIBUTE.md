# OneKey: contribute to demo

Start with [root contribute file](../CONTRIBUTE.md)

## Add a new vhost

1. create a new configuration file in `/src`
2. add it in [index.ts](./src/index.ts)
3. add the new configuration in [fake-hosts.ts](./scripts/fake-hosts.ts)
4. generate a pair of (public, private) keys with the `generateKeyPair()` function available [crypto/digital-signature.ts](../paf-mvp-core-js/src/crypto/digital-signature.ts)
5. copy the content of the public key to a `public-key.pem` file
6. copy the content of the private key to a `private-key.pem` file
7. add a new directory in [configs](./configs)
   1. create a new config file
   2. move the keys in this directory
8. re-generate the SSL certificate (see [README.md](README.md))
