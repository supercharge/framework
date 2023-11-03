
/**
 * This interface defines key-value-pairs stored in the shared request state.
 * Extend this interface in a userland typing file and use TypeScript’s
 * declaration merging features to provide IntelliSense in the app.
 *
 * We’re not using a `Record`-like interface with an index signature, because
 * the index signature would resolve all keys to the `any` type. Using the
 * empty interface allows everyone to merge their interface definitions.
 */

import { InputBag } from '../input-bag.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpStateData {
  //
}

export interface StateBag<State = HttpStateData> extends InputBag<State> {

}
