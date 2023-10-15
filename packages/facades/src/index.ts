
import { AppFacade } from './app'
import { EnvFacade } from './env'
import { HashFacade } from './hash'
import { ViewFacade } from './view'
import { LogFacade } from './logger'
import { CryptFacade } from './crypt'
import { RouteFacade } from './route'
import { ConfigFacade } from './config'
import { DatabaseFacade } from './database'
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

export * from './facade'
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
