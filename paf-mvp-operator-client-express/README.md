# Prebid Addressability Framework (PAF) Operator client: ExpressJS implementation

An implementation of the PAF operator client, served by ExpressJS web server.

It includes:
- a "backend client": an ExpressJS middleware responsible for triggering HTTP redirects to the operator, when needed, to query ids and preferences cookies.
- a "client proxy": it provides endpoints needed by the [frontend library](../paf-mvp-frontend)
  to sign and verify messages sent to and received from the operator. 

See [website-design](../addressable-network-proposals/blob/main/mvp-spec/website-design.md) for details

## PAF implementation projects
```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "../paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript")
    click Core "../paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "../paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API")
    click Operator "../paf-mvp-operator-express" "paf-mvp-operator-express"
    
    Client("Operator client<br>(you are here)")
    style Client fill:#ff9a36,stroke:#333,stroke-width:2px
    click Client "../paf-mvp-operator-client-express" "paf-mvp-operator-client-express"
    
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
