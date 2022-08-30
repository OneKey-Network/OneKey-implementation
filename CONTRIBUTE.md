# OneKey: contribute to the implementation project

## Dependencies

Each subdirectory contains a `package.json` that _should_ be updated to enable extracting each project in the future,
but the only one that **must** be kept up to date is [the root package.json](package.json).

## Versions

- for **node** version, see [.nvmrc](.nvmrc)
- for **typescript** version, see [package.json](package.json)

## Git Submodules 

This repository has the documentation as a git sub-module. It allows to specify what version of the documentation the project is matching and to use the json schemas defined in the documentation. To update to the sub-module with the last version of the documentation, do:

```
git submodule foreach git pull origin main
```

Or go directly in the sub-directory `addressability-framework` and use your usual git commands for pulling the branch/commit that matter.
