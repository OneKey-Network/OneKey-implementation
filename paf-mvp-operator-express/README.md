# Prebid Addressability Framework (PAF) Operator: ExpressJS implementation

An implementation of the PAF operator API, served by ExpressJS web server.

It implements the latest version of the [Operator API](https://github.com/prebid/addressability-framework/blob/main/mvp-spec/operator-api.md)

## PAF implementation projects
```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript")
    click Core "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API<br>(you are here)")
    style Operator fill:#ff9a36,stroke:#333,stroke-width:2px
    click Operator "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-operator-express" "paf-mvp-operator-express"
    
    Client("Operator client")
    click Client "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-client-express" "paf-mvp-client-express"
    
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
