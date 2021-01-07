'use strict'

const { Response } = require('../dist/response')

describe('HttpResponse', () => {
  it('share', () => {
    const user = { name: 'Marcus' }
    const session = { id: 1 }

    const response = new Response({ state: {} })
      .share({ user })
      .share({ session })

    expect(response.state()).toEqual({ user, session })
  })

  it('state', () => {
    const user = { name: 'Marcus' }
    const response = new Response({ state: {} }).share({ user })
    expect(response.state()).toEqual({ user })

    const shareKeyValue = new Response({ state: {} }).share('name', 'Marcus')
    expect(shareKeyValue.state()).toEqual({ name: 'Marcus' })
  })
})
