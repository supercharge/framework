<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    Supercharge is an open-source Node.js framework <br>
    making your server-side development enjoyable.
  </p>
  <br/>
  <p>
    <a href="#framework-development"><strong>Framework Development</strong></a> ·
    <a href="#resources"><strong>Resources</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/core"><img src="https://img.shields.io/npm/v/@supercharge/core.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/core"><img src="https://img.shields.io/npm/dm/@supercharge/core.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
Supercharge is a full-stack Node.js framework — not just a web-framework or HTTP router.

The framework is written in TypeScript providing IntelliSense for all areas you’re interacting with the core.

> **Notice:** This repository contains the code of the Supercharge framework. It provides the core functionality for your apps. It’s not the app boilerplate itself. Head over to the main [Supercharge application repository](https://github.com/superchargejs/supercharge) when building a Supercharge app.


## Framework Development
The framework is structured as a [Lerna](https://lerna.js.org/) monorepo. It contains the required dependencies to create a local version on your computer.

Follow these steps to set up a local development environment for the framework:

#### 1. Clone this repository
  ```bash
  git clone git@github.com:supercharge/framework.git
  ```

#### 2. Install NPM dependencies
  ```bash
  npm install
  ```

#### 3. Bootstrap package dependencies (using lerna)
  ```bash
  npm run bootstrap
  ```

#### 4. Build the packages
  ```bash
  npm run build
  ```

That’s it! You can start developing new features for the framework.


### Testing Packages
Testing the framework is the combination of running the tests of each package. Each package in the framework has their own tests. You can run the full test suite by running the tests of each package or you can test individual packages. You don’t need to run tests from all packages when developing a feature.

Run tests for a selected package by navigating to the package directory `cd packages/<package-name>` and run `npm test` in the terminal:


### Run All Tests
You can run all tests from the framework’s root directory unsing `npm test`. This triggers the tests of all packages.


### Testing a Single Package
Let’s take the `logging` package as an example. You can test the logging package like this:

```bash
cd packages/logging
npm test
```


## Resources

- [Documentation](https://superchargejs.com/docs)
- [App Boilerplate](https://github.com/supercharge/supercharge)


## License
Supercharge is [MIT licensed](https://github.com/supercharge/framework/blob/2.x/LICENSE).

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@supercharge](https://github.com/supercharge/) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
