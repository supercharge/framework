'use strict'

import { Plugin } from 'vite'
import { SuperchargePlugin } from './supercharge-plugin'
import { PluginConfigContract } from './contracts/plugin'

/**
 * Supercharge plugin for Vite.
 *
 * @param config - the config object or paths relative path to assets to be compiled
 *
 * @returns {Plugin}
 */
export function supercharge (config: string | string[] | PluginConfigContract): Plugin {
  return new SuperchargePlugin(config)
}
