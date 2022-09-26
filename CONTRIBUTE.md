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

## Update NPM packages

When **a new PR is opened**, the package version of the following sub-directories must be updated:
- [paf-mvp-core-js](paf-mvp-core-js/package.json)
- [paf-mvp-client-express](paf-mvp-client-express/package.json)
- [paf-mvp-operator-express](paf-mvp-operator-express/package.json)

This can be done **in each directory** _by hand_ or via npm

-   for example for a refactoring: 
    ```shell
    npm version patch
    ```
-   or for a new feature:
    ```shell
    npm version minor
    ```
-   or for a breaking change:
    ```shell
    npm version major
    ```

When **the PR is merged**, the new versions of these packages must be deployed to NPM.

**In each directory**:

```shell
npm publish
```

Note that you must be part of the [OneKey NPM organisation](https://www.npmjs.com/settings/onekey) and be authenticated to publish.
