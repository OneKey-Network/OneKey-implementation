# OneKey implementation


## Overview
Implementation repository for OneKey.

Reference implementation of the Minimum Viable Product (MVP) defined [here](https://github.com/criteo/addressable-network-proposals/tree/main/mvp-spec).

The demo website can be visited here [publisher-demo](https://www.pafdemopublisher.com/)

```mermaid

flowchart TB

    Demo("Demo Project")
    style Demo fill:#f5f5f5,stroke:#d2d2d2,stroke-width:2px
    click Demo "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-demo-express" "paf-mvp-demo-express"
    
    Core("Core Javascript")
    click Core "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-core-js" "paf-mvp-core-js"
    
    Frontend("Frontend library & widget")
    click Frontend "https://github.com/prebid/paf-mvp-implementation/tree/main/paf-mvp-frontend" "paf-mvp-frontend"
    
    Operator("Operator API")
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

## Getting started

Clone the repository with its submodules: 

````
git clone --recurse-submodules https://github.com/prebid/paf-mvp-implementation.git
````

## Directories

| Sub-project                                            | Description                                                                                                                                         |
|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| [paf-mvp-demo-express](./paf-mvp-demo-express)         | A set of **demo** publishers and advertisers hosted on NodeJS and using Prebid Addressability Framework                                             |
| [paf-mvp-frontend](./paf-mvp-frontend)                 | The official implementation of a **frontend client** for OneKey, including Javascript library and reference **UI widgets**                          |
| [paf-mvp-client-express](./paf-mvp-client-express)     | A NodeJS (Express) implementation of the [client node](https://github.com/prebid/addressability-framework/blob/main/mvp-spec/paf-client-node.md)    |
| [paf-mvp-operator-express](./paf-mvp-operator-express) | A NodeJS (Express) implementation of the [operator API](https://github.com/criteo/addressable-network-proposals/blob/main/mvp-spec/operator-api.md) |
| [paf-mvp-core-js](./paf-mvp-core-js)                   | The Javascript fondation (**data model**, endpoint paths...) used by all other projects                                                             |
| [paf-mvp-cmp](./paf-mvp-cmp)                           | A OneKey and TCF compatible CMP widget                                                                                                              |
| [paf-mvp-audit](./paf-mvp-audit)                       | The code to generate and show an audit log viewer                                                                                                   |

To run a demo project of OneKey, visit [paf-mvp-demo-express](./paf-mvp-demo-express)
