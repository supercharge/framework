'use strict'

import { Application, ConfigStore, EnvStore } from '@supercharge/contracts/src'

export interface ContainerBindings {
  'app': Application
  'container': Application

  'env': EnvStore
  'config': ConfigStore
}
