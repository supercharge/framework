'use strict'

const Net = require('net')
const GetPort = require('get-port')

class FaktoryMockServer {
  constructor () {
    this._port = null
    this.server = this.createServer()
  }

  createServer () {
    const server = Net.createServer()

    server.on('connection', socket => {
      server
        .once('HELLO', ({ socket }) => socket.write('+OK\r\n'))
        .on('END', ({ socket }) => socket.destroy())

      socket.on('data', (chunk) => {
        const string = chunk.toString()
        const [command] = string.replace(/\r\n$/, '').split(' ', 1)
        const rawData = string.replace(`${command} `, '')
        let data = rawData
        try {
          data = JSON.parse(rawData)
        } catch (_) {}
        server.emit(command, { command, data, socket })
        server.emit('*', { command, data, socket })
      })

      socket.write('+HI {"v":2}\r\n')
      server.emit('HI')
    })

    return server
  }

  port () {
    return this._port
  }

  async findPort () {
    this._port = await GetPort()
  }

  async start () {
    await this.findPort()
    this.server.listen(this.port(), '127.0.0.1')
  }

  async stop () {
    this.server.close()
  }
}

module.exports = FaktoryMockServer
