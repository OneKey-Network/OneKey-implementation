# Prebid Addressability Framework (PAF): Demo websites

A demo project to play with the different actors of Prebid Addressability Framework.

## Install

```
git submodule init
npm install
npm run update
```

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

## Use cases

### Publisher

Depending on the configuration in [config.ts](src/config.ts), the publisher's website has different integration modes
to read Prebid SSO ID:
- http redirect
    - the **operator URL** is built by the publisher's backend (using an "operator API backend client library")
    - the http server replies with a `303` redirect
- `<meta>` html tag
    - same logic, but the redirect is part of the returned HTML page
- **pure Javascript** integration
    - in this configuration, the publisher's website references an endpoint **hosted on the CMP backend**
    - this endpoint is protected by CORS configuration to only allow the CMP clients
    - the CMP dynamically builds the **operator URL** and generates **a Javascript script**
    - the script redirects the browser (using Javascript)
    - in this scenario, the publisher backend has no knowledge of Prebid SSO

### Advertiser

As an illustration, the advertiser's website uses **HTTP** redirects to the operator to read Prebid cookie.
