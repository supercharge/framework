'use strict'

import { Application, ConfigStore, EnvStore, HttpKernel } from '@supercharge/contracts'

export interface ContainerBindings {
  'app': Application
  'container': Application

  'env': EnvStore
  'config': ConfigStore

  'http.kernel': HttpKernel
}
