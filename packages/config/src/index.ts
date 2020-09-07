'use strict'

import { ConfigBootstrapper } from './bootstrapper'
import { ConfigStore } from '@supercharge/contracts'
import { Config as ConfigRepository } from './config'

const Config: ConfigStore = new ConfigRepository()

export { Config, ConfigBootstrapper }
