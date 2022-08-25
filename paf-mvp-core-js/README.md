# OneKey core Javascript library

This library provides core files used
by different OneKey Javascript projects.

In particular:
- cookies and messages data model
- cookies and messages builders
- signature & signature verification

## OneKey implementation projects
```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/OneKey-Network/paf-mvp-implementation/tree/main/paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript<br>(you are here)")
    style Core fill:#ff9a36,stroke:#333,stroke-width:2px
    click Core "https://github.com/OneKey-Network/paf-mvp-implementation/tree/main/paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "https://github.com/OneKey-Network/paf-mvp-implementation/tree/main/paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API")
    click Operator "https://github.com/OneKey-Network/paf-mvp-implementation/tree/main/paf-mvp-operator-express" "paf-mvp-operator-express"
    
    Client("Operator client")
    click Client "https://github.com/OneKey-Network/paf-mvp-implementation/tree/main/paf-mvp-client-express" "paf-mvp-client-express"
    
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
