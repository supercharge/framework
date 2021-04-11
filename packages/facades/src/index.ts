'use strict'

import { AppFacade } from './app'
import { EnvFacade } from './env'
import { ViewFacade } from './view'
import { LogFacade } from './logger'
import { RouteFacade } from './route'
import { ConfigFacade } from './config'
import { Application, EnvStore, ConfigStore, Logger, HttpRouter, ViewEngine } from '@supercharge/contracts'

const Log: Logger = new LogFacade() as unknown as Logger
const Env: EnvStore = new EnvFacade() as unknown as EnvStore
const App: Application = new AppFacade() as unknown as Application
const View: ViewEngine = new ViewFacade() as unknown as ViewEngine
const Route: HttpRouter = new RouteFacade() as unknown as HttpRouter
const Config: ConfigStore = new ConfigFacade() as unknown as ConfigStore

export * from './facade'
export { App, Env, Config, Log as Logger, Route, View }
