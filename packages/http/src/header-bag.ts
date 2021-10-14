'use strict'

import { InputBag } from './input-bag'
import { HeaderBag as HeaderBagContract } from '@supercharge/contracts'

export class HeaderBag<HttpHeaders> extends InputBag<HttpHeaders> implements HeaderBagContract<HttpHeaders> {}
