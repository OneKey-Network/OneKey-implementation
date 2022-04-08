# Prebid Addressability Framework (PAF): contribute to demo

## Quick start
0. Prepare SSL

Generate certificates
```sh
openssl req -out paf.csr -newkey rsa:2048 -nodes -keyout paf.key -extensions req_ext -config openssl-csr.conf
openssl x509 -req -days 3650 -in paf.csr -signkey paf.key -out paf.crt -extensions req_ext -extfile openssl-csr.conf
```
Add root certificate as a trusted one

Mac OS

```shell
sudo security add-trusted-cert -d -r trustRoot -k "$HOME/Library/Keychains/login.keychain" paf.crt
```

Windows

```shell
CertUtil -addStore Root paf.crt
```
1. Launch the server locally:

```shell
npm install
npm run build
npm run start
```

2. Edit your `/etc/hosts` file or equivalent to fake your web browser to target `localhost`.
    1. See console logs when starting the server for details
3. Access [the portal](http://portal.pafdemo.com) to **generate an ID**
4. Access any of the clients' websites ([advertiser](http://advertiser.com) or [publisher](http://publisher.com))
    1. advertiser uses a backend operator client and has its own proxy
    2. publisher _doesn't_ use any backend operator client, and its proxy is provided by the CMP host
5. Watch the redirects to get Prebid ID
6. To repeat, remove the cookie on the client's domain and refresh
7. Test with:
    1. browsers known to **not** support 3PC (Safari)
    2. browsers known to support 3PC, but disable it in settings
8. You can remove the cookie from the portal and see the impact

## Add a vhost

1. create a new configuration file in `/src`
2. generate an EC private key
   1. For example: `openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem`
   2. copy its content to the config file, as `privateKey`
2. generate the corresponding EC public key
   1. For example: `openssl ec -in private-key.pem -pubout -out public-key.pem`
   2. copy its content to the config file, as `publicKey`
