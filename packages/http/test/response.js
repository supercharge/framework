
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { setupApp } from './helpers/index.js'
import { Response, HttpRedirect, Server } from '../dist/index.js'

let app = setupApp()

test.before.each(async () => {
  app = setupApp()
  await app.boot()
})

test('share', () => {
  const user = { name: 'Marcus' }
  const session = { id: 1 }

  const response = new Response({ raw: { state: {} } })
    .share({ user })
    .share({ session })

  expect(response.state().all()).toEqual({ user, session })
})

test('state', () => {
  const user = { name: 'Marcus' }
  const response = new Response({ raw: { state: {} } }).share({ user })
  expect(response.state().all()).toEqual({ user })

  const shareKeyValue = new Response({ raw: { state: {} } }).share('name', 'Marcus')
  expect(shareKeyValue.state().all()).toEqual({ name: 'Marcus' })
})

test('response.getPayload', async () => {
  function createAppUsing (createResponseCallback) {
    const server = app.forgetInstance(Server).make(Server)

    server.router().get('/', ({ response }) => {
      return response.payload({
        payload: createResponseCallback(response)
      })
    })

    return server
  }

  // the framework removes the response payload when not assigning any non-empty data
  await Supertest(
    createAppUsing(response => {
      return response.getPayload()
    }).callback()
  )
    .get('/')
    .expect(200, { })

  // return the previously assigned payload
  await Supertest(
    createAppUsing(response => {
      return response.payload('ok').getPayload()
    }).callback()
  )
    .get('/')
    .expect(200, { payload: 'ok' })
})

test('response.cookie() creates a signed cookie by default', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=ooJzAUpkODKlv98H8OWyGG6vnPo; path=/; httponly'
  ])
})

test('response.cookie() creates a signed cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().signed())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=ooJzAUpkODKlv98H8OWyGG6vnPo; path=/; httponly'
  ])
})

test('response.cookie() creates an unsigned (plain) cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a cookie that expiresIn a number of milliseconds', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('expiresNumber', 'Supercharge', cookie => cookie.unsigned().expiresIn(5))
        .cookie('expiresString', 'Supercharge', cookie => cookie.unsigned().expiresIn('1min'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    `expiresNumber=Supercharge; path=/; expires=${new Date(Date.now() + 5).toUTCString()}; httponly`,
    `expiresString=Supercharge; path=/; expires=${new Date(Date.now() + 60 * 1000).toUTCString()}; httponly`
  ])
})

test('throws on response.cookie() when not providing expiration time', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      expect(() => {
        response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresIn())
      }).toThrow('Strings and numbers are supported arguments in method "expiresIn"')

      return response.payload('ok')
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')
})

test('response.cookie() creates a cookie that expiresAt', async () => {
  const inOneYear = new Date()
  inOneYear.setFullYear(inOneYear.getFullYear() + 1)

  const server = app
    .make(Server)
    .use(({ response }) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt(inOneYear))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie'][0]).toContain(`expires=${inOneYear.toUTCString()}`)
})

test('throws on response.cookie() when not providing an argument to expiresAt', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
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

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')
})

test('response.cookie() sets a path', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().path('/custom'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/custom; httponly'])
})

test('response.cookie() sets a domain', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().domain('sub.superchargejs.com'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; domain=sub.superchargejs.com; httponly'])
})

test('response.cookie() configures httpOnly', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().httpOnly(false))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/'])
})

test('response.cookie() falls back to httpOnly when not providing a value', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().httpOnly(null))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates unsecured cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().unsecured())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a secure cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response, raw: ctx }) => {
      ctx.cookies.secure = true

      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.secure().unsigned())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; secure; httponly'])
})

test('response.cookie() creates a sameSite strict cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite(true))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=strict; httponly'])
})

test('response.cookie() ignores sameSite set to false', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite(false))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a sameSite strict cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('strict'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=strict; httponly'])
})

test('response.cookie() creates a sameSite lax cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('lax'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=lax; httponly'])
})

test('response.cookie() creates a sameSite none cookie', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned().sameSite('none'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; samesite=none; httponly'])
})

test('response.cookie() uses merged config', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => {
          cookie
            .unsigned()
            .useConfig({ path: '/config', sameSite: 'strict', httpOnly: false })
        })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/config; samesite=strict'])
})

test('response.cookie() does not overwrite cookie by default', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned())
        .cookie('name', 'Marcus', cookie => cookie.unsigned())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name=Marcus; path=/; httponly'
  ])
})

test('response.cookie() overwrites cookies', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .cookie('name', 'Supercharge', cookie => cookie.unsigned())
        .cookie('name', 'Marcus', cookie => cookie.unsigned().overwrite())
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Marcus; path=/; httponly'])
})

test('set response.headers()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response
        .payload('ok')
        .header('sessionId', 1)
        .header('name', 'Supercharge')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200, 'ok')

  expect(response.headers).toMatchObject({
    sessionid: '1',
    name: 'Supercharge'
  })
})

test('get response headers', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response
        .header('sessionId', 1)
        .header('name', 'Supercharge')

      return response.payload({
        headers: response.headers()
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers).toMatchObject({
    sessionid: '1',
    name: 'Supercharge'
  })
})

test('response.headers().all()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response
        .header('foo', 'bar')
        .header('sessionId', 1)
        .header('name', 'Supercharge')
        .header('supercharge', 'is cool')

      return response.payload({
        headers: response.headers().all('name', 'foo')
      })
    })

  const response = await Supertest(server.callback())
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
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response.payload(
        response.headers().get('unavailable-header', 'defaultValue')
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'defaultValue')
})

test('response.headers().has()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response
        .header('sessionId', 1)
        .header('name', 'Supercharge')

      return response.payload(
        response.headers().has('name')
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'true')
})

test('response.headers().remove()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response
        .header('sessionId', 1)
        .header('name', 'Supercharge')

      return response.payload(
        response.headers().remove('name')
      )
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({ sessionid: '1' })
  expect(response.body).not.toMatchObject({ name: 'Supercharge' })
})

test('response.withHeaders()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response.withHeaders({
        sessionId: 1,
        name: 'Supercharge'
      })

      return response.payload(
        response.headers()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, {
      sessionid: '1',
      name: 'Supercharge',
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.appendHeader()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      response
        .header('name', 'Supercharge')
        .appendHeader('name', 'Marcus')

      return response.payload(
        response.headers()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, {
      name: ['Supercharge', 'Marcus'],
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.removeHeader()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response.payload(
        response
          .header('foo', 'bar')
          .header('name', 'Supercharge')
          .removeHeader('foo')
          .headers()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, {
      name: 'Supercharge',
      'content-type': 'application/json; charset=utf-8'
    })
})

test('response.status()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }, next) => {
      return response.status(204)
    })

  await Supertest(server.callback())
    .get('/')
    .expect(204)
})

test('response.getStatus()', async () => {
  const server = app.forgetInstance(Server).make(Server)

  server
    .use(async ({ response }, next) => {
      response.status(201)

      await next()
    })
    .router().get('/', async ({ response }) => {
      return response.payload({
        statusCode: response.getStatus()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(201, { statusCode: 201 })
})

test('response.hasStatus()', async () => {
  const server = app.make(Server)

  server.router().get('/', async ({ response }) => {
    return response.status(201).payload({
      200: response.hasStatus(200),
      201: response.hasStatus(201)
    })
  })

  await Supertest(server.callback())
    .get('/')
    .expect(201, {
      200: false,
      201: true
    })
})

test('response.isOk()', async () => {
  function createAppUsingResponseStatus (code) {
    const server = app.forgetInstance(Server).make(Server)

    server.router().get('/', async ({ response }) => {
      return response.payload({
        isOk: response.status(code).isOk()
      })
    })
    return server
  }

  await Supertest(createAppUsingResponseStatus(200).callback())
    .get('/')
    .expect(200, { isOk: true })

  await Supertest(createAppUsingResponseStatus(201).callback())
    .get('/')
    .expect(201, { isOk: false })
})

test('response.isEmpty() for 204', async () => {
  function createAppUsingResponseStatus (code) {
    const server = app.forgetInstance(Server).make(Server)

    server.router().get('/', async ({ response }) => {
      response.payload({
        isEmpty: response.status(code).isEmpty()
      })

      // reset the response status code so that the payload will be sent
      // otherwise, for status code 204 the framework removes the response body
      return response.status(200)
    })

    return server
  }

  await Supertest(createAppUsingResponseStatus(204).callback())
    .get('/')
    .expect(200, { isEmpty: true })

  await Supertest(createAppUsingResponseStatus(304).callback())
    .get('/')
    .expect(200, { isEmpty: true })

  await Supertest(createAppUsingResponseStatus(201).callback())
    .get('/')
    .expect(200, { isEmpty: false })
})

test('response.type()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return response.payload('html').type('foo/bar')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers['content-type']).toEqual('foo/bar')
})

test('response.etag()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return response.payload('html').etag('md5HashSum')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.headers.etag).toEqual('"md5HashSum"')
})

test('response.redirect()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      const redirect = response.redirect()
      expect(redirect).toBeInstanceOf(HttpRedirect)

      return redirect.to('/other-uri-path')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/other-uri-path')
})

test('response.redirect(withUrl)', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      const redirect = response.redirect()
      expect(response.redirect('/to')).toBeInstanceOf(HttpRedirect)

      return redirect
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/to')
})

test('response.permanentRedirect()', async () => {
  const server = app
    .make(Server)
    .use(async ({ response }) => {
      const redirect = response.permanentRedirect()
      expect(redirect).toBeInstanceOf(HttpRedirect)

      return redirect.to('/other-permanent-path')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(301)

  expect(response.headers.location).toEqual('/other-permanent-path')
})

test('response.isRedirect()', async () => {
  const server = app.forgetInstance(Server).make(Server)

  server
    .use(async ({ response }, next) => {
      response.redirect().to('/uri')

      await next()
    })
    .router().get('/', ({ response }) => {
      return response.payload({
        isRedirect: response.isRedirect()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(302, { isRedirect: true })
})

test('response.isRedirect() with specific status code', async () => {
  const server = app.forgetInstance(Server).make(Server)

  server
    .use(async ({ response }, next) => {
      response
        .permanentRedirect()
        .to('/uri')

      await next()
    })
    .router().get('/', ({ response }) => {
      return response.payload({
        isPermanentRedirect: response.isRedirect(301),
        isTemporaryRedirect: response.isRedirect(302)
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(301, {
      isPermanentRedirect: true,
      isTemporaryRedirect: false
    })
})

test('response.view()', async () => {
  // faking the view render method
  const view = app.make('view')
  view.render = (template, data, viewConfig) => {
    return { template, data, viewConfig }
  }

  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return await response.view('test-view')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view', data: {}, viewConfig: {} })
})

test('response.view() with data', async () => {
  // faking the view render method
  const view = app.make('view')
  view.render = (template, data, viewConfig) => {
    return { template, data, viewConfig }
  }

  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return await response.view('test-view', { name: 'Supercharge' })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view', data: { name: 'Supercharge' }, viewConfig: {} })
})

test('response.view() with layout', async () => {
  // faking the view render method
  const view = app.make('view')
  view.render = (template, data, viewConfig) => {
    return { template, data, viewConfig }
  }

  const server = app
    .make(Server)
    .use(async ({ response }) => {
      return await response.view('test-view-with-layout', builder => builder.layout('main-layout'))
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toEqual({ template: 'test-view-with-layout', data: {}, viewConfig: { layout: 'main-layout' } })
})

test('response.throw()', async () => {
  const server = app.make(Server)

  server.router().get('/', ({ response }) => {
    return response.throw(418, 'Teapot Supercharge')
  })

  server.router().get('/500', ({ response }) => {
    return response.throw(500, '500 Error')
  })

  await Supertest(server.callback())
    .get('/')
    .expect(418, 'Teapot Supercharge')

  await Supertest(server.callback())
    .get('/500')
    .expect(500, '500 Error')
})

test.run()
