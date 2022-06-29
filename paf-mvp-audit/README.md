# OneKey Reference Audit Log Viewer UI

# Quick Start

The following code added to any HTML page that can access the
ok-ui-audit-en-us.js script will demonstrate the features of the audit log by
adding a OneKey icon under the initial div element.

```html
<div id="advert" style="width: 200px; margin: 0 auto; background-color: aqua;">
  <p style="text-align: center">Narrow Advert</p>
</div>
<script src="dist/ok-ui-audit-en-us.js"></script>
<script>
  const advert = document.getElementById("advert");

  // Options; 'all-good', 'result-error', 'corrupt-signature', 'identity-not-found'
  advert.setAttribute('auditLog', 'all-good');

  // Add the audit viewer.
  new OKA.Controller().bind(advert.id);
</script>
```

In production use the method that handles the bid response must use the `paf-lib`
functions to build the audit log from the OpenRTB response. The audit log JSON
returned from `paf-lib` can then set in the auditLog attribute of the advert
element before the new instance of `OKA.Controller` is created and the bind method
called with the id of the advert.

The bind method will insert a OneKey icon under the advert which when pressed
will open the Audit Viewer.

## Configuration Options

The constructor of the `OKA.Controller` class takes two parameters.

-   brandName: provides the name used whenever an entity that is responsible for
    providing the audit log needs to be named. This will typically be the name
    of the publisher who initiated the opportunity to display an advertisement.
-   logoUrls: an array of string URLs that relate to logos that should appear in
    the header of the audit viewer related to the brand of the entity that is
    responsible for providing the audit log. This might include the brand logo
    of the publisher and advertiser, or their suppliers.

# Overview

## Performance

The module will be loaded after all the other content on the page. Therefore,
the position of the script tag within the page is not material and is likely
best placed at the end of the page and marked as lower priority.

The module is implemented to defer any high-cost activity, such as the fetching
of public keys needed for verification, until the point the user engages with
the module. As such the audit viewer module does not know if the audit log is
valid or contains suspicious activity or violations until the user interacts
with the OneKey icon under the advert.

The tapping of the OneKey icon under the advert will initiate all activity. A
single parent Promise is used to commence verification which only resolves when
all the identifies are fetched and verification has been completed. The module
displays an in-progress status page whilst this background activity is being
carried out.

## Developers

The approach taken to localization, and other aspects of the module design, are
identical to the Consent Management Platform (CMP) and are not described in this
readme.

The jest tests of the audit log model save their mocked audit logs to the
`assets/mocks` folder. These are then used if available at build time to add mock
audit logs into the bundle that can selected by using the file name without the
`.json` extension. For example; ‘all-good.json’ would be referred to as ‘all-good’
when adding the attribute to the advert element.

The `rollup.config.js` contains some additional features to bundle the mock audit
logs for the purposes of demonstration and testing.

The resulting bundle is a umd format bundle that contains the OKA.Controller
public class.

### Cryptography

Modules `ec-key and` and `ecdsa-secp256r1` are used for common cryptography
functions across the repository.

`ec-key only` to convert PEM format public keys into JWK format.

`ecdsa-secp256r1` is used across the project in Node and browser code. Prior to
use in the audit module only the Node version was being used. The audit module
requires the browser version. A bug in the current NPM module relating to the
decoding of signatures in the web browser needs to be fixed by the package
maintainer before the official package can be used. A fork of the package has
been made and added to the repository as a sub module where the bug has been
fixed. Once confirmed working in Prebid the maintainer can be contacted to apply
the fix to the `ecdsa-secp256r1` package.
