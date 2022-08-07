'use strict'

import { describe, it, expect } from 'vitest'
import { resolvePageComponent } from '../dist'

describe('inertia-helpers', () => {
  const path = './__fixtures__/dummy.js'

  it('pass glob value to resolvePageComponent', async () => {
    const file = await resolvePageComponent(path, import.meta.glob('./__fixtures__/*.js'))
    expect(file.default).toBe('Dummy File')
  })

  it('pass eagerly globed value to resolvePageComponent', async () => {
    const file = await resolvePageComponent(path, import.meta.glob('./__fixtures__/*.js', { eager: true }))
    expect(file.default).toBe('Dummy File')
  })

  it('pass glob value to resolvePageComponent', async () => {
    await expect(
      resolvePageComponent('./__fixtures__/not-existing.js', import.meta.glob('./__fixtures__/*.js'))
    ).rejects.toThrow('Inertia page not found: ./__fixtures__/not-existing.js')
  })
})
