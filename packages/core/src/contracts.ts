'use strict'

import { Server } from '@supercharge/http'
import { Application, ConfigStore, EnvStore, HttpKernel } from '@supercharge/contracts'

export interface ContainerBindings {
  'app': Application
  'container': Application

  'env': EnvStore
  'config': ConfigStore

  'http.kernel': HttpKernel
  'http.server': Server
  Server: Server
}
