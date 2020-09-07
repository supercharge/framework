'use strict'

import { ConfigStore } from '@supercharge/contracts'
import { Config as ConfigRepository } from './config'
import { ConfigBootstrapper } from './bootstrapper'

const Config: ConfigStore = new ConfigRepository()

export { Config, ConfigBootstrapper }
