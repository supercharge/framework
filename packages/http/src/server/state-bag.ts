
import _ from 'lodash'
import { InputBag } from './input-bag.js'
import { StateBag as StateBagContract, HttpStateData } from '@supercharge/contracts'

export class StateBag<State = HttpStateData> extends InputBag<State> implements StateBagContract<State> {

}
