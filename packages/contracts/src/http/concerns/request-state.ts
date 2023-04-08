'use strict'

/**
 * This interface defines key-value-pairs stored in the shared request state.
 * Extend this interface in a userland typing file and use TypeScript’s
 * declaration merging features to provide IntelliSense in the app.
 */
export interface RequestState {
  [key: string]: any
}
