# OneKey client node: ExpressJS implementation

An implementation of the OneKey client, served by ExpressJS web server.

It includes a "client node" which provides endpoints needed by the [frontend library](../onekey-mvp-frontend)
  to sign and verify messages sent to and received from the operator. 

See [website-design](../addressable-network-proposals/blob/main/mvp-spec/website-design.md) for details

## OneKey implementation projects
```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/OneKey-Network/OneKey-implementation/tree/main/onekey-mvp-demo-express" "onekey-mvp-demo-express"
    
    Core("Core Javascript")
    click Core "https://github.com/OneKey-Network/OneKey-implementation/tree/main/onekey-mvp-core-js" "onekey-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "https://github.com/OneKey-Network/OneKey-implementation/tree/main/onekey-mvp-frontend" "onekey-mvp-frontend"
    
    Operator("Operator API")
    click Operator "https://github.com/OneKey-Network/OneKey-implementation/tree/main/onekey-mvp-operator-express" "onekey-mvp-operator-express"
    
    Client("Operator client<br>(you are here)")
    style Client fill:#ff9a36,stroke:#333,stroke-width:2px
    click Client "https://github.com/OneKey-Network/OneKey-implementation/tree/main/onekey-mvp-client-express" "onekey-mvp-client-express"
    
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
