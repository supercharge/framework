'use strict'

import { Env as EnvRepository } from './env'
import { EnvBootstrapper } from './bootstrapper'
import { EnvStore } from '@supercharge/contracts'

const Env: EnvStore = new EnvRepository()

export { Env, EnvBootstrapper }
