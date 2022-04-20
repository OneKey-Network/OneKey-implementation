# OneKey Reference Consent Management Platform (CMP) UI

# Overview

The output from this project is a single JavaScript resource file that contains the entire CMP.

The functionality requires a CMP provider that has enabled CORS access from the publisher or advertiser domain. The host
name of this CMP provider will be needed before deploying the CMP UI.

# For Publishers and Advertisers

The script adds the HTML elements to the DOM at the point it is included. It should be a blocking include to render the
UI as soon as possible and enable the web site to continue loading and fetching data whilst the user interacts with the 
dialogue. All the resources needed to provide the UI are embedded in the single small JavaScript resource.

## Performance

To improve overall performance a preload link element should be added at the beginning of the `<head>` element. This 
will commence fetching the JavaScript resource as soon as possible in the page render process.

```html
<link rel="preload" as="script" href="https://domain.com/assets/cmp/ok-ui.js">
```

If this link is not added then the functionality will still be provided by page load time will be marginally impaired.

## Script

The script element and attributes must be added to the `<body>` element. See the following example.

```html
<script src="https://domain.com/assets/cmp/ok-ui.js" 
    data-display-intro="true"
    data-snackbar-timeout-ms="5000" 
    data-proxy-host-name="cmp.pafdemopublisher.com" 
    data-brand-name="CMP PAF Demo Pub"
    data-brand-privacy-url="https://github.com/prebid/paf-mvp-implementation"></script>
```

The DOM is modified at the point the script is included and there are no other deployment options.

## Configuration options

The following attributes must be present in the script tag.

- data-display-intro: True to display the introduction card, or false to skip straight to the settings card after a possible redirect.
- data-snackbar-timeout-ms: The number of milliseconds to wait for the snackbar to disappear.
- data-proxy-host-name: The host name to use when reading and writing data from the global storage.
- data-brand-name: The brand name to use throughout the user interface.
- data-brand-privacy-url: This URL is needed to inform the user about the privacy policy of the brand.

If these are invalid or not provided then errors are written to the console and the UI will not function.

# For Developers

## Languages

Language variants are provided in the `./src/locales` folder where the name of the YAML file relates to the common
language code. The `./src/locales` class should be updated to reference all the possible locales. The required fields
are defined in the class. The US english locale is used where specific text is not provided.

## Views

HTML snippets are available as views in the `./src/views` folder. They are taken from the associated Storybook pattern
library. The `./src/view` class handles the selection and application of the current locale.

The CSS, images, and JS needed by the views is included in the `./src/css`, `./src/images` and `./src/script` folders.
These are embedded in the the resource as strings and added to the DOM when the UI is loaded. There are no external
dependent resources.

## Model

The data model is contained in the class `./src/model`. Two way binding between the view cards and the data model is
supported. Each field supports multiple bindings to UI elements for different purposes. For example the preference field
binds to HTML text elements, radio buttons, and multiple custom settings for specific marketing choices. The generic 
`./src/binding` and `./src/fields` classes support the model.

## Controller
 
`./src/controller` implements the controller for the UI, references the other classes, and the dependent project paf-lib.
The primary logic relates to loading the UI and fetching the current data state from the paf-lib in the constructor. It
also handles actions and changes to the current displayed card.

## Actions

HTML `<button>` and `a` tags in views that have the following data attributes are bound to actions in the controller.

- data-card: changes the currently displayed card to the value provided. Allowed card names match the file names in the ./views folder.
- data-action: one of the listed actions. Other values are ignored.

The following lists the allowed values for data-action.

- save: saves the model to persistent storage.
- refresh: refreshes the data from the global storage.
- refuseAll: flags that the solution has been rejected for the domain in question.
- reset: rests the random identifier.