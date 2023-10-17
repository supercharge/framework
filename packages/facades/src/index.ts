
import { AppFacade } from './app.js'
import { EnvFacade } from './env.js'
import { HashFacade } from './hash.js'
import { ViewFacade } from './view.js'
import { LogFacade } from './logger.js'
import { CryptFacade } from './crypt.js'
import { RouteFacade } from './route.js'
import { ConfigFacade } from './config.js'
import { DatabaseFacade } from './database.js'
import { Application, ConfigStore, Database as DatabaseContract, Encrypter, EnvStore, Logger, HttpRouter, ViewEngine, Hasher } from '@supercharge/contracts'

const Log: Logger = new LogFacade() as unknown as Logger
const Hash: Hasher = new HashFacade() as unknown as Hasher
const Env: EnvStore = new EnvFacade() as unknown as EnvStore
const App: Application = new AppFacade() as unknown as Application
const View: ViewEngine = new ViewFacade() as unknown as ViewEngine
const Crypt: Encrypter = new CryptFacade() as unknown as Encrypter
const Route: HttpRouter = new RouteFacade() as unknown as HttpRouter
const Config: ConfigStore = new ConfigFacade() as unknown as ConfigStore
const Database: DatabaseContract = new DatabaseFacade() as unknown as DatabaseContract

export { Facade } from './facade.js'
export {
  App,
  Config,
  Crypt,
  Database,
  Env,
  Hash,
  Log as Logger,
  Route,
  View
}
