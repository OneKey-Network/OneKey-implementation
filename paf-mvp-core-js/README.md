# Prebid Addressability Framework (PAF) core Javascript library

This library provides core files used
by different PAF Javascript projects.

In particular:
- cookies and messages data model
- cookies and messages builders
- signature & signature verification

## PAF implementation projects
```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/criteo/paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript<br>(you are here)")
    style Core fill:#ff9a36,stroke:#333,stroke-width:2px
    click Core "https://github.com/criteo/paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "https://github.com/criteo/paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API")
    click Operator "https://github.com/criteo/paf-mvp-operator-express" "paf-mvp-operator-express"
    
    Client("Operator client")
    click Client "https://github.com/criteo/paf-mvp-operator-client-express" "paf-mvp-operator-client-express"
    
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
