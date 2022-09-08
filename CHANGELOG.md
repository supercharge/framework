# Changelog

## [3.8.0](https://github.com/supercharge/framework/compare/v3.8.0...v3.8.0) - 2022-08-xx

### Added
- `@supercharge/env`:
    - add `.number` method: returns the given environment variable as a number

### Updated
- bump dependencies
- `@supercharge/env`:
    - `Env.set()` returns `this` to fluently chain calls
- `@supercharge/vite`:
    - register Vite view helpers in the service provider’s `boot` method (instead of `register`) which makes sure the `view` container binding is available


## [3.7.1](https://github.com/supercharge/framework/compare/v3.7.0...v3.7.1) - 2022-08-22

### Updated
- bump dependencies
- `@supercharge/contracts`:
    - refined types for `StateBag#get` when providing a default value
- `@supercharge/http`:
    - use lodash `merge` instead of the `deepmerge` package
    - remove `deepmerge` dependency


## [3.7.0](https://github.com/supercharge/framework/compare/v3.6.0...v3.7.0) - 2022-08-22

### Added
- `@supercharge/hashing`: a new package providing hashing support based on the bcrypt algorithm
- `@supercharge/contracts`:
    - export hashing contracts
    - add `merge` method to `StateBag` contract
- `@supercharge/facades`:
    - add `Hash` facade for the hashing service
- `@supercharge/http`:
    - `StateBag` class: add `merge` method

### Updated
- bump dependencies
- `@supercharge/contracts`:
    - extend `StateBag#get` contract: add `defaultValue` as an optional, second parameter
- `@supercharge/http`:
    - `StateBag` class:
        - `add` method supports nested keys
        - `add` method merges nested fields instead of overriding them
        - `has` method supports nested keys
        - `remove` method supports nested keys
        - `isMissing` method supports nested keys

### Fixed
- `@supercharge/http`:
    - `StateBag` class:
        - `has` method correctly handles falsy values
        - `isMissing` method correctly handles falsy values


## [3.6.0](https://github.com/supercharge/framework/compare/v3.5.0...v3.6.0) - 2022-08-17

### Added
- `@supercharge/vite`: SSR support via the `ssr` and `ssrOutputDirectory` options

### Updated
- bump dependencies


## [3.5.0](https://github.com/supercharge/framework/compare/v3.4.0...v3.5.0) - 2022-08-11

### Added
- `@supercharge/vite`: [Vite](https://vitejs.dev) plugin and package
    - exposes a Vite plugin for the Supercharge framework
    - registers a `vite` view helper to generate script and stylesheet tags
    ```js
    <html>
        <head>
            {{{ vite "resources/js/app.js" }}}
        </head>
    </html>
    ```
- `@supercharge/view`
    - add `registerHelper(name, helperDelegateFunction)` method: register a view helper dynamically in a service provider (for example in community packages)
    - add `registerPartial(name, content)` method: register a partial view dynamically in a service provider (for example in community packages)
    - add `hasPartial(name)` method: determine whether the view engine has a partial view with the given `name`
    - add `hasHelper(name)` method: determine whether the view engine has a view helper with the given `name`
- `@supercharge/contracts`
    - expose `Application#register(provider: ServiceProvider)` method (which was already implemented in `@supercharge/application`)
    - add `Htmlable` contract
- `@supercharge/support`
    - export `HtmlString` class implementing the `Htmlable` contract

### Updated
- bump dependencies
- `@supercharge/application`
    - `publicPath(...paths)` method now supports multiple paths. This allows us to use something like `app.publicPath('foo/bar')` and `app.publicPath('foo', 'bar')` resolving to the same path `public/foo/bar`


## [3.4.0](https://github.com/supercharge/framework/compare/v3.3.0...v3.4.0) - 2022-07-27

### Added
- `@supercharge/contracts`
    - extend `HttpResponse` contract (with the methods below in `@supercharge/http`)
    - add `onBooting` method to `Application` contract
- `@supercharge/http`
    - add `response.getPayload()` method: returns the currently assigned response payload
    - add `response.hasStatus(<code>)` method: determine whether the response has a given status `code`
    - add `response.isOk()` method: determine whether the response has the status code `200 OK`
    - add `response.isEmpty()` method: determine whether the response has one of the status codes `204 No Content` or `304 Not Modified`
- `@supercharge/application`
    - add `onBooting` method: register a callback that runs when the app boots

### Updated
- bump dependencies
- `@supercharge/http`
    - update `request.isMethod(<method | method-array>)` method: support an array as the argument determining whether the request’s method is one of the given candidates (e.g. `request.isMethod(['GET', 'POST']) // true`)
    - lowercase all header names before accessing them from request headers (Node.js lowercases all request headers)


## [3.3.0](https://github.com/supercharge/framework/compare/v3.2.0...v3.3.0) - 2022-07-23

### Added
- `@supercharge/contracts`
    - extend `Application` contract by adding the `withErrorHandler` method
- `@supercharge/view`
    - add `registerPartial(name, content)` method: register a partial view dynamically in a service provider (for example in community packages)
- `@supercharge/http`
    - add `request.protocol()` method: returns the URL protocol
    - add `request.queryString()` method: returns the URL’s query string as a string value
    - add `request.isXmlHttpRequest()` method: is an alias for `isAjax` (see next line)
    - add `request.isAjax()` method: determine whether the request is a result of an AJAX call
    - add `request.isPjax()` method: determine whether the request is a result of an PJAX call
    - add `request.isPrefetch()` method: determine whether the request is a result of a [prefetch call](https://developer.mozilla.org/en-US/docs/Glossary/Prefetch)
    - add `request.fullUrl()` method: returns the full URL including including protocol, host[:port], path, and query string

### Updated
- bump dependencies


## [3.2.0](https://github.com/supercharge/framework/compare/v3.1.0...v3.2.0) - 2022-07-19

### Added
- `@supercharge/contracts`
    - export `HttpRequestCtor` interface which can be used when resolving the `'request'` constructor binding from the container
    - export `HttpResponseCtor` interface which can be used when resolving the `'response'` constructor binding from the container
- `@supercharge/session`
    - use the `HttpRequestCtor` interface
- `@supercharge/http`
    - add `response.getStatus()` method: returns the HTTP response status code
    - add `response.isRedirect(statusCode?: number)` method: determine whether the response is an HTTP redirect (optionally checking for the given `statusCode`)
    - make `Response` macroable allowing users to decorate the response with custom functions

### Updated
- bump dependencies


## [3.1.0](https://github.com/supercharge/framework/compare/v3.0.0...v3.1.0) - 2022-07-17

### Added
- `@supercharge/http`
    - `state().clear()` method: clear all items from the shared state
- `@supercharge/application`: move `Application` class to a dedicated package
- `@supercharge/encryption`: add encryption package
- `@supercharge/facades`:
    - add `Crypt` facade for the encrypter service

### Updated
- bump dependencies


## [3.0.0](https://github.com/supercharge/framework/compare/v2.0.0-alpha.10...v3.0.0) - 2022-06-20

### Added
- `@supercharge/session`: a Supercharge session package
- `@supercharge/http`
    - `ctx()` method: added to request and response. Allows you to access the HTTP context from the related instance
    - `useragent()` method: retrieve the client’s user agent from the request instance
    - make `Request` macroable allowing users to decorate the request with custom functions
    - add `InteractsWithState` trait to the HTTP request
    - `InteractsWithState` trait returns a state bag instead of a plain object (please check the breaking changes)
- `@supercharge/config`
    - add `isEmpty(key)` method: determine whether the config store contains an item for the given `key` with is empty
    - add `isNotEmpty(key)` method: determine whether the config store contains an item for the given `key` with is not empty
    - add `ensureNotEmpty(key)` method: throws an error if the config store contains an item for the given `key` which has an empty value
- `@supercharge/manager`
    - change visibility of methods to `protected` allowing extending classes to call them

### Updated
- bump dependencies of all packages

### Breaking Changes
- Require Node.js v16. Drop support for Node.js v12 and v14
- `@supercharge/contracts`
    - the exported `HttpMethods` type only exports HTTP methods in uppercase
- `@supercharge/http`
    - instances using the `InteractsWithState` trait (HTTP context/request/response) return a state bag instead of a plain JS object

    ```js
    // before
    const state = request.state()

    // after
    const stateBag = request.state()
    stateBag.all() // returns the full shared state JS object
    stateBag.get(key)
    stateBag.add(key, value) // add key-value-pair
    stateBag.add({ key: value}) // add an object containing key-value-pairs
    ```


## [2.0.0-alpha.10](https://github.com/supercharge/framework/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) - 2022-05-08

### Updated
- `@supercharge/database`
  - bump dependencies
  - refine typings for Model methods `findById` and `deleteById`


## [2.0.0-alpha.9](https://github.com/supercharge/framework/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) - 2022-03-01

### Updated
- `@supercharge/console`
  - bump dependencies
- `@supercharge/container`
  - refine container contracts: retrieve the resolved type when using a class in `make`
- `@supercharge/http`
  - refine input bag contracts: detect whether the `get` method retrieves a default value
  - make `request.payload<T>()` generic allowing developers to define a request payload type


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
