# OneKey Reference Consent Management Platform (CMP) UI

# Publisher Quick Start

## Setup

**Step 1.** Register your domain with the CMP provider and request the
proxy-host-name domain. A list of CMP providers is available in the
[main OneKey documentation](https://github.com/prebid/addressability-framework/blob/main/README.md).

**Step 2.** Add the following snippet after the `<body>` element of the web
page.

```HTML
<script src="https://[proxy-host-name]/assets/cmp/ok-ui.min.js" 
    data-brand-name="Your Publisher Name"
    data-brand-privacy-url="Your Privacy Policy URL"></script>
```

Replace `proxy-host-name` in the `src` attribute of the script element with the
proxy host name provided by the CMP provider in step 1.

Optionally change the `data-brand-name` and `data-brand-privacy-url` values to
those associated with your brand.

Tip: Verify that your privacy URL includes references to the Model Terms
referenced in the
[main OneKey documentation](https://github.com/prebid/addressability-framework/blob/main/README.md).

**Step 3.** Add the following snippet to the footer of the web page where
`preferences` is the id of the element that when clicked will display the CMP.
Placing such an element on every page to enable the user to rapidly inspect and
alter their choices is a requirement of the Model Terms.

```HTML
<script>
document.querySelector('#preferences')
    .addEventListener('click', (e) => {
        e.preventDefault();
        OneKey.refreshIdsAndPreferences('doPrompt');
    });
</script>
```

## Verify

1.  Access the web page modified in Step 2 from a browser that has not
    previously accessed OneKey and verify the CMP dialogue appears.
2.  Complete the CMP choosing either personalized or standard marketing.
3.  Check that cookies called `paf_identifiers` and `paf_preferences` are
    written to the cookie store of your website.
4.  When revisiting the website verify that the reminder about OneKey appears in
    the footer before disappearing.
5.  Configure the Prebid adapter to use these values for advertising.

## Configuration Options

The following attributes must be present in the script tag.

-   **data-brand-name**: The brand name to use throughout the user interface.
-   **data-brand-privacy-url**: This URL is needed to inform the user about the
    privacy policy of the brand. The privacy policy must reference the Model
    Terms.

The following attributes are optional.

-   **data-proxy-host-name**: The host name to use when reading and writing data
    from the global storage if not the same as the host name of the script.
-   **data-display-intro**: True to display the introduction card, or false to
    skip straight to the settings card after a possible redirect depending on
    the storage mechanisms the web browser supports. Defaults to false.
-   **data-site-only-cookie-tcf-core**: The name of the cookie used to store the
    TCF core string. If not provided the “this site only option” is not
    available to users.
-   **data-snackbar-timeout-ms**: The number of milliseconds to wait for the
    snackbar to disappear. Defaults to 5000.
-   **data-template-tcf-core-string**: The [template TCF core
    string](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md?msclkid=5236f9f5c47b11ec8a04e36f3dd976c9#the-core-string)
    that will be used when generating the resulting TCF core string from the
    CMP. This project will change the Purposes Consents, Created, and
    LastUpdated fields of the provided value when writing the TCF core string to
    the cookie. See [IAB TCF](https://iabtcf.com/#/encode) web site to generate
    this value. TODO: Move this to the rollup.config.js and pull into the CMP
    build process as an environment variable.

If these are invalid, or not provided where mandatory, errors are written to the
console with the prefix `ok-ui`.

# Overview

This project will produce a series of language specific CMP builds, and a loader
to select the correct language bundle for the browser based on the browser's
advertised language codes.

A CMP provider that has enabled CORS access from the publisher or advertiser
domain is needed if the CMP backend is not self-hosted.

# For Publishers and Advertisers

The script adds the HTML elements to the DOM at the point it is included. It
should be a blocking script to render the UI as soon as possible and enable the
web site to continue loading and fetching data whilst the user interacts with
the dialogue. All the resources needed to provide the UI are embedded in the
single small JavaScript bundles.

If the UI is not needed, then the cookie data will have been verified and will
be usable for requests in advertising after the script execution has been
complete. Publishers can be confident further advertising related requests will
be using current user’s preferences and browser pseudo anonymous identifiers.

## Performance (1)

If a server-side environment is available, then choose the language bundle using
the HTTP header `Accept-Language` and avoid using the `ok-ui.js` loader to
determine the language preference client side.

If the browser prefers `en-GB` rather than the `src` attribute will become
`ok-ui-en-gb.min.js` and not `ok-ui.js`.

## Performance (2)

To improve overall performance a preload link element should be added at the
beginning of the `<head>` element. This will commence fetching the JavaScript
resource as soon as possible in the page render process. This will be
particularly noticeable when HTTPS/2 is used.

For example to preload the loader the following then following would be used.

```html
<link rel="preload" as="script" href="https://domain.com/assets/cmp/ok-ui.js">
```

If the server has already worked out the correct language bundle the following
would be used.

```html
<link rel="preload" as="script" href="https://domain.com/assets/cmp/ok-ui-en-gb.js">
```

If this link is not added, then the functionality will still be provided by page
load time will be marginally impaired.

This technique can be further improved by modifying the `link` header of the
HTTP response to specify the
[preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload)
hint.

### Performance (3)

By placing the script element for the CMP as close to the top of the `<body>`
element as possible the interface will appear on first request while the rest of
the page is loading behind it. Should the interface require a redirect to fetch
or store data then the assets for the publisher’s page will already be cached by
the web browser effectively improving user perceive page load time. Further, the
approach is likely to improve actual page load time compared to solutions which
load the interface after other page processing completes.

# For Developers

This section contains an introduction for developers maintaining or modifying
the CMP.

The module follows the Model View Controller (MVC) pattern, supports multiple
languages, contains features to improve performance, and simplify reskinning.

## Languages

Language variants are provided in the `./src/locales` folder where the name of
the YAML file relates to the common language code. The `./src/locales` class
should be updated to reference all the possible locales. The required fields are
defined in the class. The US English locale is used where specific text is not
provided.

See `./rollup.config.js` to learn how the different language configurations are
determined at build time.

## Storybook

The `../paf-mvp-pattern-library` contains the components and styles. Any changes
to the output from [Storybook](https://storybook.js.org/) need to be applied to
this project.

### HTML

HTML snippets are available as cards, components and containers in the
`./src/html` folder.

The `./src/view` class manipulates these HTML resources at runtime.

### CSS, Images, and JavaScript

The CSS, images, and JS needed by the view is included in the `./src/css`,
`./src/images` and `./src/script` folders. These are embedded in the resource as
template strings and added to the DOM when the UI is loaded. There are no
external dependent resources.

## Model

The data model is contained in the class `./src/model`. Two way binding between
the view cards and the data model is supported. Each field supports multiple
bindings to UI elements for different purposes. For example, the preference
field binds to HTML text elements, radio buttons, and multiple custom settings
for specific marketing choices. The generic `./src/binding` and `./src/fields`
classes support the model.

## Controller

`./src/controller` implements the controller for the UI, references the other
classes, and the dependent project paf-lib. The primary logic relates to loading
the UI and fetching the current data state from the paf-lib in the constructor.
It also handles actions and changes to the current displayed card.

## Actions

HTML `<button>` and `a` tags in views that have the following data attributes
are bound to actions in the controller.

-   **data-card**: changes the currently displayed card to the value provided.
    Allowed card names match the file names in the `./views/cards` folder.
-   **data-action**: one of the listed actions. Other values are ignored.

The available values for data-actions are.

-   **save**: saves the model to persistent storage.
-   **refresh**: refreshes the data from the global storage.
-   **refuseAll**: flags that the solution has been rejected for the domain in
    question.
-   **reset**: rests the random identifier.

## Why Vanilla?

-   The functionality is simple and doesn’t benefit from a framework. The bundle
    size is small as a result.
-   Changing the “skin” or “theme” is simple for those adapting the project as
    they don’t need to touch the TypeScript code and only need to modify the
    HTML and CSS.
-   Authors of language files will not be familiar with JSON. YAML is easier for
    them to understand and work with in tools familiar to them.
-   The relationship between the fields in the model is quite complex. No
    framework avoids this complexity. This logic is contained in the
    `./src/model` class.
-   There are a lot of frameworks and different opinions concerning which is the
    best. It is better for the project not to get involved and allow those
    adapting the CMP to decide if they wish to use a specific framework.
-   Storybook has been used to compartmentalise the skillsets needed to work on
    the project. For example, the developer working on the “skin” or “theme”
    does not need to know about TypeScript, or vice-versa.

## Performance

Several features have been added to the project to improve performance. These
are called out here.

-   **TCF** – The IAB Tech Lab opensource project for manipulating TCF strings
    increased the size of the minified bundle by around 50kb. Treeshaking and
    other optimisation techniques could not be used to reduce this. The
    `./src/tcfcore` class is a light weight alternative containing just the
    features the CMP needs. The `./tests/tcfcore.test.ts` tests compare the 
    functionality to the IAB Tech Lab module to verify the output is identical. 
    Like the IAB Tech Lab the project does not use the Node.js Buffer class
    because it is not supported in the browser environment, and instead uses a 
    custom base64 string encoder.
-   **Rollup** – Creating a single bundle would be simple but involve all the
    possible languages being embedded increasing bundle size. The
    `./rollup.config.js` contains the logic to create a config for each language
    and generate loader to choose the best bundle for the language configuration
    of the browser. Other optimisation features such as HTML minification are
    included.
-   **Dependencies** – There are no runtime dependencies so that the bundle is
    fully functional as soon as it is loaded by the browser. This means elements
    of `paf-lib` are embedded in the CMP rather than shared with other
    components on the page.

# Further Development

The following are suggestions for further development with some of the more
pressing raised as GitHub issues.

-   Add projects for server-side language selection of the bundle.
-   Split out the components into individual repositories and use submodules to
    relate them to one another. This would enable the CMP module to be changed
    independently of the other modules. As any dependent modules would reference
    a specific commit of the CMP module changes can be made easily without
    breaking the solution.
-   The TCF core string is not part of the OneKey data model. It probably should
    be to enable the easy transfer of the information among OneKey participants
    and passing the information to Prebid.
-   Simplify the public interface and purpose of the `paf-lib` such that it
    contains a single method to update data and retrieve the current state.
    Shift more of the logic into the CMP and Operator out of the client. This
    might also impact the completion of step 3 in the publisher quick start
    guide. [\#141](https://github.com/prebid/paf-mvp-implementation/issues/141)
-   Include the publisher segments of the TCF string as options in the
    configuration if the CMP module will be responsible for all the data
    assembly before passing to downstream components such as the Prebid adapter.
-   Remove tooltips from the view saving 17kb on the bundle size. Use accordion
    reveal to display the information.
-   If the publishers host their own identity end point then retrieve the common
    name and the privacy URL from that common end point if not provided in the
    configuration attributes. This would remove all mandatory attributes from
    the configuration marginally simplifying deployment where the identity
    endpoint has been configured.
-   Remove `detect-browser` from the overall project saving \~9kb on the bundle
    size. Use an interface to enable the developer to pass in their preference
    for checking third-party cookie support.
    [\#141](https://github.com/prebid/paf-mvp-implementation/issues/140)
