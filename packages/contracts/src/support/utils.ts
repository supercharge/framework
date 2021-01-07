'use strict'

export type Class<T = any, Arguments extends any[] = any[]> = new(...arguments_: Arguments) => T
