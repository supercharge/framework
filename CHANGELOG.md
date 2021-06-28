# Changelog

## [2.0.0-alpha.3](https://github.com/supercharge/framework/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) - 2021-0x-xx

### Added
- `@supercharge/http`
    - the `response.redirect().to(<path>)` method now returns the redirect instance (instead of `void`)
    - refine types of `request.headers` to use the `IncomingHttpHeaders` interface
- `@supercharge/view`
    - add handlebars helpers: `append` , `prepend`

### Updated
- tba.


## [2.0.0-alpha.2](https://github.com/supercharge/framework/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) - 2021-06-25

### Added
- `@supercharge/http`
    - created a base controller

### Updated
- refined lerna configuration to bootstrap without lock files
- `@supercharge/contracts` and `@supercharge/routing`
    - refine types for route groups allowing strings (representing the path to a route file)
- `@supercharge/contracts`
    - refine types for application booting callbacks allowing `unknown` instead of `void`
- `@supercharge/http`
    - refine typings for request properties (moving to `Record<K, V>`)

### Removed
- remove `CHANGELOG.md` files from the individual packages (leaving only this changelog as a central place)


## [2.0.0-alpha.1](https://github.com/supercharge/framework/compare/v1.0.0-beta1...v2.0.0-alpha.1) - 2021-06-23

### Updated
- full framework rewrite in TypeScript and bringing some new ideas and architecture to the project


## [1.0.0-beta0.1](https://github.com/supercharge/framework/compare/v1.0.0-beta0...v1.0.0-beta0.1) - 2019-02-23

### Changed
- move required packages from `devDependencies` to `dependencies` (`package.json`)
- set publish config in `package.json` to public (required for scoped packages)


## 1.0.0-beta0 - 2019-02-23

First beta release :rocket: :tada:
