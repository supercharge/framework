
import { test } from 'uvu'
import { expect } from 'expect'
import { HtmlString } from '../dist/index.js'

test('static from', () => {
  const str = '<h1>Hello Supercharge</h1>'
  const html = HtmlString.from(str)
  expect(str).toEqual(html.toHtml())
})

test('toHtml', () => {
  const str = '<h1>Hello Supercharge</h1>'
  const html = new HtmlString(str)
  expect(str).toEqual(html.toHtml())
})

test('toString', () => {
  const str = '<h1>Hello Supercharge</h1>'
  const html = new HtmlString(str)

  expect(str).toEqual(html.toString())
  expect(str).toEqual(String(html))
})

test('isEmpty', () => {
  const html = new HtmlString()

  expect(html.isEmpty()).toBe(true)
  expect(html.isNotEmpty()).toBe(false)

  expect(new HtmlString('').isEmpty()).toBe(true)
  expect(new HtmlString(null).isEmpty()).toBe(true)
})

test.run()
