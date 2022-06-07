'use strict'

const { specReporter } = require('@japa/spec-reporter')
const { runFailedTests } = require('@japa/run-failed-tests')
const { processCliArgs, configure, run } = require('@japa/runner')

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/

const plugins = []

if (!process.env.CI) {
  plugins.push(runFailedTests())
}

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    plugins,
    timeout: 2000,
    files: ['test/**/*.js'],
    reporters: [specReporter()],
    importer: (filePath) => require(filePath),
    filters: {
      // files: ['mongodb-service-provider.js']
    }
  }
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
