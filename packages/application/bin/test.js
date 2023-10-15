
import { spec } from '@japa/runner/reporters'
import { processCLIArgs, configure, run } from '@japa/runner'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCLIArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/

const plugins = []

if (!process.env.CI) {
  plugins.push(
    // TODO: add Japa plugin
    )
}

processCLIArgs(process.argv.slice(2))

configure({
  plugins,
  timeout: 2000,
  files: ['test/**/*.js'],
  reporters: {
    activated: ['spec'],
    list: [spec()]
  },
  importer: (filePath) => import(filePath),
  filters: {
    // files: ['cookie-session-driver.js']
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
