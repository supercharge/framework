
import { test } from 'uvu'
import { expect } from 'expect'
import { resolvePageComponent } from '../dist/index.js'

const testPage = './fixtures/test-page.js'

test('pass glob value to resolvePageComponent', async () => {
  const file = await resolvePageComponent(testPage, import.meta.glob('./fixtures/*.js'))
  expect(file.default).toBe('Dummy File')
})

test('pass eagerly globed value to resolvePageComponent', async () => {
  const file = await resolvePageComponent(testPage, import.meta.glob('./fixtures/*.js', { eager: true }))
  expect(file.default).toBe('Dummy File')
})

test('fails for non-existing page', async () => {
  await expect(
    resolvePageComponent('./fixtures/not-existing.js', import.meta.glob('./fixtures/*.js'))
  ).rejects.toThrow('Inertia page not found: ./fixtures/not-existing.js')
})

test.run()
