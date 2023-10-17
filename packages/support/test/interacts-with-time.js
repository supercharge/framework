
import Dayjs from 'dayjs'
import { test } from 'uvu'
import { expect } from 'expect'
import { promisify } from 'node:util'
import ChildProcess from 'node:child_process'
import { InteractsWithTime } from '../dist/index.js'

const exec = promisify(ChildProcess.exec)

test('currentTime', async () => {
  const time = new InteractsWithTime()
  const { stdout: unixTimestamp } = await exec('date +%s')

  expect(time.currentTime()).toEqual(Number(unixTimestamp))
})

test('availableAt', async () => {
  const now = new Date()
  const time = new InteractsWithTime()

  expect(time.availableAt(now)).toEqual(now.getTime())

  const expected = Dayjs().add(60, 'seconds').toDate().getTime()
  expect(time.availableAt(60)).toBeGreaterThan(expected - 5)
  expect(time.availableAt(60)).toBeLessThanOrEqual(expected + 5)
})

test.run()
