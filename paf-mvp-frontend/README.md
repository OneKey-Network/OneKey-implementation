# OneKey frontend library and widget

The frontend components for websites using OneKey:

- a Javascript script to identify users (get user ids and preferences)
- a UI widget to get end user consent for personalized advertising

## OneKey implementation projects

```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/OneKey-Network/OneKey-implementation/tree/main/paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript")
    click Core "https://github.com/OneKey-Network/OneKey-implementation/tree/main/paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget<br>(you are here)")
    style Frontend fill:#ff9a36,stroke:#333,stroke-width:2px
    click Frontend "https://github.com/OneKey-Network/OneKey-implementation/tree/main/paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API")
    click Operator "https://github.com/OneKey-Network/OneKey-implementation/tree/main/paf-mvp-operator-express" "paf-mvp-operator-express"
    
    Client("Operator client")
    click Client "https://github.com/OneKey-Network/OneKey-implementation/tree/main/paf-mvp-client-express" "paf-mvp-client-express"
    
    Demo --> Frontend
    linkStyle 0 stroke:#d2d2d2,stroke-width:1px
    Demo --> Operator
    linkStyle 1 stroke:#d2d2d2,stroke-width:1px
    Demo --> Client
    linkStyle 2 stroke:#d2d2d2,stroke-width:1px
    Demo --> Core
    linkStyle 3 stroke:#d2d2d2,stroke-width:1px
    
    Frontend --> Core
    Client --> Core
    Operator --> Core

```

See [addressable-network-proposals](https://github.com/OneKey-Network/addressability-framework/blob/main/mvp-spec/paf-client-node.md)
for more context on the operator **frontend** and **backend** clients and the operator **proxy**

## Identification library integration

To integrate the identification library into a website, website owners should inject the JS script, for example:

```html
<script
  src="https://my-cdn.domain/assets/onekey.js"
  data-client-hostname="cmp.pifdemopublisher.com" <!-- host name of the client node -->
  data-cookie-ttl="PT30S" <!-- cookie TTL -->
></script>
```

Once the script is available, a few methods can be called to manipulate OneKey data,
like `OneKey.getIdsAndPreferences` or `OneKey.generateSeed`.

All details of these public methods in [i-one-key-lib](./src/lib/i-one-key-lib.ts)

Also interesting:
- [paf-mvp-client-express](../paf-mvp-client-express) for technical details
- [paf-mvp-demo](../paf-mvp-demo-express) for examples of integration

## Widget integration

To integrate the widget into a website, website owners should inject the app bundle:

```html

<script 
  src="https://my-cdn.domain/assets/app.bundle.js"
  data-proxy="https://cmp-proxy.url">
</script>
```
To get the user's consent, the widget provides the following API:

`OneKey.promptConsent(): Promise<boolean>` - displays the widget with OneKey information and returns Promise with user's response

`OneKey.showNotification(notificationType: NotificationEnum)` - displays a snack bar with a predefined message
