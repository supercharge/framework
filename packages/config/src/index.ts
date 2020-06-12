'use strict'

import { Config } from './config'
import { ConfigStore } from '@supercharge/contracts'

const store: ConfigStore = new Config()

export = store
