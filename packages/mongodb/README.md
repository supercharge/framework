<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>Moon</h3>
  </p>
  <p>
    An elegant MongoDB ORM
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#resources"><strong>Docs</strong></a> ·
    <a href="#quick-usage-overview"><strong>Usage</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/moon"><img src="https://img.shields.io/npm/v/@supercharge/moon.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/moon"><img src="https://img.shields.io/npm/dm/@supercharge/moon.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
Moon is a simple to use MongoDB ORM. It maps JavaScript model classes to dollections and documents in MongoDB.


## Installation

```
npm i @supercharge/moon
```


## Resources

- 📖 &nbsp;[Documentation](https://superchargejs.com/docs/moon)


## Quick Usage Overview
Using `@supercharge/moon` is pretty straightforward. TBA.

```js
const { Database, Model } = require('@supercharge/moon')

class User extends Model {}

const db = new Database()

db.register(User)
await db.connect()

const users = await User.all()
const user = await User.findById('mongodb-document-id')
```


## Contributing
Do you miss a function? We very much appreciate your contribution! Please send in a pull request 😊

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀


## License
MIT © [Supercharge](https://superchargejs.com)

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@supercharge](https://github.com/supercharge) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
