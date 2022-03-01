# Changelog

## [2.0.0-alpha.10](https://github.com/supercharge/framework/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) - 2022-xx-xx

### Added
- tba.

### Updated
- tba.


## [2.0.0-alpha.9](https://github.com/supercharge/framework/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) - 2022-03-01

### Updated
- `@supercharge/console`
  - bump dependencies
- `@supercharge/container`
  - refine container contracts: retrieve the resolved type when using a class in `make`
- `@supercharge/http`
  - refine input bag contracts: detect whether the `get` method retrieves a default value
  - make `request.payload<T>()` generic allowing developers to define a request payload type

## Breaking Changes
- **require Node.js v14**: drop support for Node.js v12


## [2.0.0-alpha.8](https://github.com/supercharge/framework/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) - 2022-01-15

### Added
- `@supercharge/contracts`
    - extend the HTTP kernel contract with additional methods
- `@supercharge/database`
    - add static `Model.deleteById` method
- `@supercharge/http`
    - use a `CookieBag` to set response cookies
    - refactor the `CookieBag#set(key, value, cookieBuilder)` method to support a `cookieBuilder` as the third argument
    - all classes from `@supercharge/routing` are now part of this ``@supercharge/http` package
    - exports all classes from the previous `@supercharge/routing` package
    - add `request.isMethodCacheable` and  `request.isMethodNotCacheable` methods
    - add `logger()` method to HTTP controller
    - add `request.contentLength()` method

### Updated
- bump dependencies
- `@supercharge/contracts`
    - refine typings of `ParameterBag#get` method
- `@supercharge/database`
    - bump to Objection.js 3.0
    - remove duplicated model method `Model.findById` in base model
    - remove not needed `Model.findByIdOrFail` method (see breaking changes)

### Deleted
- `@supercharge/routing` is now merged into the `@supercharge/http` package

### Breaking Changes
- `@supercharge/core`
  - removed `app.debug()` method
- `@supercharge/database`
    - remove `Model.findByIdOrFail()` method
        - use query builder chain instead: `Model.findById().orFail()`


## [2.0.0-alpha.7](https://github.com/supercharge/framework/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) - 2021-10-12

### Notice
- this release is also required to publish the updated packages because of an NPM outage: https://status.npmjs.org/incidents/wy4002vc8ryc

### Added
- `@supercharge/core`
    - add a `kernel.server()` method to the HTTP kernel providing the server instance
    - expose a `kernel.serverCallback()` bootstrapping the HTTP kernel and returning the `server.callback()` method.

### Updated
- `@supercharge/config`
    - refine generic contract for `config.get<T>()`


## [2.0.0-alpha.6](https://github.com/supercharge/framework/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) - 2021-10-11

### Added
- `@supercharge/config`
    - `config.get<T>(key, defaultValue)` now supports a generic return type `T`
- `@supercharge/contracts`
    - add `HttpServer` contract
- `@supercharge/http`
    - the HTTP `Server` class implements the `HttpServer` contract
    - HTTP server: expose a `server.callback()` method that is useful for testing and compatible with Node.js’ native HTTP server
- `@supercharge/core`
    - add a `kernel.server()` method to the HTTP kernel providing the server instance
    - expose a `kernel.serverCallback()` bootstrapping the HTTP kernel and returning the `server.callback()` method.

### Updated
- bump dependencies


## [2.0.0-alpha.5](https://github.com/supercharge/framework/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) - 2021-09-29

### Added
- `@supercharge/contracts`
    - extend the container types to resolve classes when passed to as a namespace
    - extend the HTTP `Request` contract, added methods:
        - `request.hasPayload()`
        - `request.setPayload()`
        - `request.rawPayload()`
        - `request.setRawPayload()`
        - `request.isContentType(...types)`
        - `request.contentType()`
        - `request.req()`: returns the raw Node.js request
        - `request.all()`: returns the merged request payload, query parameters, and files
        - `request.input()`: retrieve a single request input
        - `request.files()`
        - `request.setFiles()`
- `@supercharge/http`
    - added `HeaderBag`, `ParameterBag`, `FileBag` classes to provide helpful methods to access request input
    - add bodyparser middleware replacing the previously used `koa-body`
    - add `booted` method to the `HttpKernel` class
    - call the `register` method of the `HttpKernel` to register “booted” callbacks
    - add request `CookieBag` to to retrieve cookies from the incoming request
    - implement the new HTTP request methods
- `@supercharge/container`
    - add handling to bind and resolve classes as the namespace in the container

### Updated
- bump dependencies
- `@supercharge/contracts`
    - use `Record<string, any>` as types for `request.params` and `request.query`
- `@supercharge/core`
    - use `HttpError` class from `@supercharge/errors` as base class
    - removed `bootstrap` method from `HttpKernel`
- `@supercharge/http`
    - refactor the HTTP Server to properly initialize and save the server instance
- `@supercharge/routing`
    - add comments to `RouteCollection`
    - refine comments of `Router` methods
    - internal refinements of the `RouteCollection`

### Breaking Changes
- `@supercharge/http`
    - the properties `request.query`, `request.params`, and `request.headers` return an input bag instead of an object
    ```js
    // before
    const query = request.query
    const params = request.params
    const headers = request.headers

    // after
    const query = request.query().all()
    const params = request.params().all()
    const headers = request.headers().all()
    ```
    - rename exported middlewares:
      - `HandleCors` -> `HandleCorsMiddleware`
      - `VerifyCsrfToken` -> `VerifyCsrfTokenMiddleware`
      - `ServeStaticAssets` -> `ServeStaticAssetsMiddleware`


## [2.0.0-alpha.4](https://github.com/supercharge/framework/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) - 2021-07-09

### Added
- add npm scripts
    - `clean` to remove all node_modules folders from managed packages
    - `fresh` to freshly bootstrap all packages

### Updated
- bump dependencies
- `@supercharge/database`
    - add `sqlite3` as a default dependency
    - move to sqlite for testing
    - removed mysql NPM devDependency

### Fixed
- `@supercharge/view`
  - fix `append` helper to properly pass through the appended content stack


## [2.0.0-alpha.3](https://github.com/supercharge/framework/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) - 2021-06-28

### Added
- `@supercharge/http`
    - the `response.redirect().to(<path>)` method now returns the redirect instance (instead of `void`)
    - support a callback to customize the view config as the second or third argument in `response.view(template, data | viewBuilder)`
    - refine types of `request.headers` to use the `IncomingHttpHeaders` interface
- `@supercharge/view`
    - add handlebars helpers: `append` , `prepend`
- `@supercharge/contracts`
    - add npm script `dev` to watch and compile the contracts

### Updated
- `@supercharge/view`
  - update the `async render(template, data, config?)` method to require the second `data` parameter

### Fixed
- `@supercharge/routing`
    - handle HTTP redirect responses properly without throwing a response error


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
