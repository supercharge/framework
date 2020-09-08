'use strict'

import { QueueManager } from './queue-manager'
import { QueueBootstrapper } from './bootstrapper'

const Queue = new QueueManager()

export { Queue, QueueBootstrapper }
