'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const { expect } = require('expect')
const Supertest = require('supertest')
const { Response, HttpContext, HttpRedirect } = require('../dist')

const viewMock = {
  render (template, data, viewConfig) {
    return { template, data, viewConfig }
  }
}

const appMock = {
  make (key) {
    if (key === 'view') {
      return viewMock
    }

    if (key === 'response') {
      return Response
    }
  },
  config () {
    return {
      get () { }
    }
  }
}

test('share', () => {
  const user = { name: 'Marcus' }
  const session = { id: 1 }

  const response = new Response({ state: {} })
    .share({ user })
    .share({ session })

  expect(response.state()).toEqual({ user, session })
})

test('state', () => {
  const user = { name: 'Marcus' }
  const response = new Response({ state: {} }).share({ user })
  expect(response.state()).toEqual({ user })

  const shareKeyValue = new Response({ state: {} }).share('name', 'Marcus')
  expect(shareKeyValue.state()).toEqual({ name: 'Marcus' })
})

test('response.cookie() creates a signed cookie by default', async () => {
  const app = new Koa({ keys: ['abc'] }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=5mOcXAID6uxyDuEtEsHOSti1nWI; path=/; httponly'
  ])
})

test('response.cookie() creates a signed cookie', async () => {
  const app = new Koa({ keys: ['abc'] }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().signed())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=5mOcXAID6uxyDuEtEsHOSti1nWI; path=/; httponly'
  ])
})

test('response.cookie() creates an unsigned (plain) cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a cookie that expiresIn a number of milliseconds', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('expiresNumber', 'Supercharge', cookie => cookie.unsigned().expiresIn(5))
      .cookie('expiresString', 'Supercharge', cookie => cookie.unsigned().expiresIn('1min'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    `expiresNumber=Supercharge; path=/; expires=${new Date(Date.now() + 5).toUTCString()}; httponly`,
    `expiresString=Supercharge; path=/; expires=${new Date(Date.now() + 60 * 1000).toUTCString()}; httponly`
  ])
})

test('throws on response.cookie() when not providing expiration time', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresIn())
    }).toThrow('Strings and numbers are supported arguments in method "expiresIn"')

    return response.payload('ok')
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'ok')
})

test('response.cookie() creates a cookie that expiresAt', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt(new Date()))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie'][0]).toContain('expires=')
})

test('throws on response.cookie() when not providing an argument to expiresAt', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt())
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt(123))
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt('now'))
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    return response.payload('ok')
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'ok')
})

test('response.cookie() sets a path', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().path('/custom'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/custom; httponly'])
})

test('response.cookie() sets a domain', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().domain('sub.superchargejs.com'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; domain=sub.superchargejs.com; httponly'])
})

test('response.cookie() configures httpOnly', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().httpOnly(false))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/'])
})

test('response.cookie() creates unsecured cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().unsecured())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a secure cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    ctx.cookies.secure = true

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.secure().unsigned())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; secure; httponly'])
})

test('response.cookie() creates a sameSite strict cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite(true))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=strict; httponly'])
})

test('response.cookie() ignores sameSite set to false', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite(false))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a sameSite strict cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('strict'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=strict; httponly'])
})

test('response.cookie() creates a sameSite lax cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('lax'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=lax; httponly'])
})

test('response.cookie() creates a sameSite none cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('none'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=none; httponly'])
})

test('response.cookie() does not overwrite cookie by default', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned())
      .cookie('name', 'Marcus', cookie => cookie.unsigned())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name=Marcus; path=/; httponly'
  ])
})

test('response.cookie() overwrites cookies', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned())
      .cookie('name', 'Marcus', cookie => cookie.unsigned().overwrite())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Marcus; path=/; httponly'])
})

test('set response.headers()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .header('sessionId', 1)
      .header('name', 'Supercharge')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200, 'ok')

  expect(response.headers).toMatchObject({
    sessionid: '1',
    name: 'Supercharge'
  })
})

test('get response headers', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response
      .header('sessionId', 1)
      .header('name', 'Supercharge')

    return response.payload({
      headers: response.headers()
    })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers).toMatchObject({
    sessionid: '1',
    name: 'Supercharge'
  })
})

test('response.headers().all()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response
      .header('foo', 'bar')
      .header('sessionId', 1)
      .header('name', 'Supercharge')
      .header('supercharge', 'is cool')

    return response.payload({
      headers: response.headers().all('name', 'foo')
    })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({
    headers: {
      foo: 'bar',
      name: 'Supercharge'
    }
  })
})

test('get response header default value', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      response.headers().get('name', 'defaultValue')
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'defaultValue')
})

test('response.headers().has()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response
      .header('sessionId', 1)
      .header('name', 'Supercharge')

    return response.payload(
      response.headers().has('name')
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'true')
})

test('response.headers().remove()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response
      .header('sessionId', 1)
      .header('name', 'Supercharge')

    return response.payload(
      response.headers().remove('name')
    )
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({ sessionid: '1' })
  expect(response.body).not.toMatchObject({ name: 'Supercharge' })
})

test('response.withHeaders()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response.withHeaders({
      sessionId: 1,
      name: 'Supercharge'
    })

    return response.payload(
      response.headers()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, {
      sessionid: '1',
      name: 'Supercharge',
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.appendHeader()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response
      .header('name', 'Supercharge')
      .appendHeader('name', 'Marcus')

    return response.payload(
      response.headers()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, {
      name: ['Supercharge', 'Marcus'],
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.removeHeader()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      response
        .header('foo', 'bar')
        .header('name', 'Supercharge')
        .removeHeader('foo')
        .headers()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, {
      name: 'Supercharge',
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.status()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.status(204)
  })

  await Supertest(app.callback())
    .get('/')
    .expect(204)
})

test('response.type()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload('html').type('foo/bar')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['content-type']).toEqual('foo/bar')
})

test('response.etag()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload('html').etag('md5HashSum')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers.etag).toEqual('"md5HashSum"')
})

test('response.redirect()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    const redirect = response.redirect()
    expect(redirect).toBeInstanceOf(HttpRedirect)

    return redirect.to('/other-uri-path')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/other-uri-path')
})

test('response.redirect(withUrl)', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    const redirect = response.redirect()
    expect(response.redirect('/to')).toBeInstanceOf(HttpRedirect)

    return redirect
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/to')
})

test('response.permanentRedirect()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    const redirect = response.permanentRedirect()
    expect(redirect).toBeInstanceOf(HttpRedirect)

    return redirect.to('/other-permanent-path')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(301)

  expect(response.headers.location).toEqual('/other-permanent-path')
})

test('response.view()', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return await response.view('test-view')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view', data: {}, viewConfig: {} })
})

test('response.view() with data', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return await response.view('test-view', { name: 'Supercharge' })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view', data: { name: 'Supercharge' }, viewConfig: {} })
})

test('response.view() with layout', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return await response.view('test-view-with-layout', builder => builder.layout('main-layout'))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view-with-layout', data: {}, viewConfig: { layout: 'main-layout' } })
})

test('response.throw()', async () => {
  const app = new Koa().use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    response.throw(418, 'Teapot Supercharge')
  })

  await Supertest(app.callback())
    .get('/')
    .expect(418, 'Teapot Supercharge')
})

test.run()
