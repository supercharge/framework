'use strict'

const Path = require('path')
const Fs = require('fs-extra')
const Tempy = require('tempy')
const Lockfile = require('lockfile')
const { promisify: Promisify } = require('util')
const ReadRecursive = require('recursive-readdir')

const lock = Promisify(Lockfile.lock)
const unlock = Promisify(Lockfile.unlock)
const isLocked = Promisify(Lockfile.check)

class Filesystem {
  /**
   * Retrieve information about the given file. Use `access`
   * to check whether the `file` exists instead of `stat`.
   *
   * @param {String} file
   *
   * @returns {Stats}
   */
  static async stat (file) {
    return Fs.stat(file)
  }

  /**
   * Returns the file size in bytes of the file located at `path`.
   *
   * @param {String} path
   *
   * @returns {Integer}
   */
  static async size (path) {
    const { size } = await this.stat(path)

    return size
  }

  /**
   * Retrieve the time when `file` was last modified.
   *
   * @param {String} file
   *
   * @returns {Date}
   */
  static async lastModified (file) {
    const { mtime } = await this.stat(file)

    return mtime
  }

  /**
   * Retrieve the time when `file` was last accessed.
   *
   * @param {String} file
   *
   * @returns {Date}
   */
  static async lastAccessed (file) {
    const { atime } = await this.stat(file)

    return atime
  }

  /**
   * Change the file system timestamps of the
   * referenced `path`. Updates the last
   * accessed and last modified properties.
   *
   * @param {String} path
   * @param {Number} atime
   * @param {Number} mtime
   *
   * @throws
   */
  static async updateTimestamps (path, atime, mtime) {
    if (!(atime instanceof Date)) {
      throw new Error(`Updating the last accessed timestamp for ${path} requires an instance of "Date".`)
    }

    if (!(mtime instanceof Date)) {
      throw new Error(`Updating the last modified timestamp for ${path} requires an instance of "Date".`)
    }

    return Fs.utimes(path, atime, mtime)
  }

  /**
   * Test the user's permissions for the given `path` which can
   * be a file or directory. The `mode` argument is an optional
   * integer to specify the accessibility level.
   *
   * @param {String} path  - file or directory path
   * @param {Integer} mode - defaults to `fs.constants.F_OK`
   *
   * @returns {Boolean}
   * @throws
   */
  static async canAccess (path, mode) {
    return Fs.access(path, mode)
  }

  /**
   * Determines whether the given `path` exists on the file system.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  static async pathExists (path) {
    return Fs.pathExists(path)
  }

  /**
   * Shortcut for `pathExists` to check whether a given file
   * or directory exists on the file system.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  static async exists (path) {
    return this.pathExists(path)
  }

  /**
   * Determines wether the given `path` does not exists.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  static async notExists (path) {
    const exists = await this.exists(path)

    return !exists
  }

  /**
   * Ensure that the `file` exists. If the requested file and
   * directories do not exist, they are created. If the file
   * already exists, it is NOT modified.
   *
   * @param {String} file
   */
  static async ensureFile (file) {
    return Fs.ensureFile(file)
  }

  /**
   * Read the entire content of `file`. If no `encoding` is
   * specified, the raw buffer is returned. If `encoding` is
   * an object, it allows the `encoding` and `flag` options.
   *
   * @param {String} file
   * @param {String|Object} encoding
   *
   * @returns {String}
   */
  static async readFile (file, encoding = 'utf8') {
    return Fs.readFile(file, encoding)
  }

  /**
   * Read the contents of a directory with the given `path`.
   * Returns an array of the names of the files in the
   * directory excluding `.` and `..`.
   *
   * @param {String} path
   * @param {String} encoding
   *
   * @returns {Array}
   */
  static async files (path, encoding) {
    return Fs.readdir(path, encoding)
  }

  /**
   * Read the contents of the directory at the given `path`
   * recursively. Returns an array of file names
   * excluding `.`, `..`, and dotfiles.
   *
   * @param {String} path
   * @param {Object} options config object -  supports the `ignore` property: list of ignored files
   *
   * @returns {Array}
   */
  static async allFiles (path, options = {}) {
    const { ignore } = options

    return ReadRecursive(path, ignore ? [].concat(ignore) : null)
  }

  /**
   * Write file to a given location if parent
   * directory/directories does not exists
   * they will be created.
   *
   * @param  {String} path
   * @param  {String} content
   * @param  {Object} options
   */
  static async writeFile (file, content, options = 'utf8') {
    return Fs.outputFile(file, content, options)
  }

  /**
   * Removes a file or directory from the
   * file system located at `path`.
   *
   * @param {String} path
   */
  static async remove (path) {
    return Fs.remove(path)
  }

  /**
   * Removes a `file` from the file system.
   *
   * @param {String} file
   */
  static async removeFile (file) {
    return Fs.remove(file)
  }

  /**
   * Copy a file or directory from `src` to `dest`. The
   * directory can have contents. Like `cp -r`. If
   * `src` is a directory this method copies everything
   * inside of `src`, not the entire directory itself.
   *
   * If `src` is a file, make sure that `dest` is a file
   * as well (and not a directory).
   *
   * @param {String} src  - source path
   * @param {String} dest - destination path
   * @param {Object} options
   */
  static async copy (src, dest, options) {
    return Fs.copy(src, dest, options)
  }

  /**
   * Moves a file or directory from `src` to `dest`. By default,
   * this method doesn't override existingfiles. You can
   * override existing files using `{ override: true }`.
   *
   * @param {String} src  - source path
   * @param {String} dest - destination path
   * @param {Object} options
   */
  static async move (src, dest, options = {}) {
    return Fs.move(src, dest, options)
  }

  /**
   * Ensures that the directory exists. If the directory
   * structure does not exist, it is created.
   * Like `mkdir -p`.
   *
   * @param {String} dir - directory path
   */
  static async ensureDir (dir) {
    return Fs.ensureDir(dir)
  }

  /**
   * Removes a `dir` from the file system.The directory
   * can have content. Content in the directory will
   * be removed as well, like `rm -rf`.
   *
   * @param {String} dir - directory path
   */
  static async removeDir (dir) {
    return Fs.remove(dir)
  }

  /**
   * Ensures that a directory is empty. Deletes directory
   * contents if the directory is not empty. If the
   * directory does not exist, it is created.
   * The directory itself is not deleted.
   *
   * @param {String} dir
   */
  static async emptyDir (dir) {
    return Fs.emptyDir(dir)
  }

  /**
   * Changes the permissions of a `file`.
   * The `mode` is a numeric bitmask and
   * can be an integer or string.
   *
   * @param {String} file
   * @param {String|Integer} mode
   */
  static async chmod (file, mode) {
    return Fs.chmod(file, parseInt(mode, 8))
  }

  /**
   * Ensures that the link from source to
   * destination exists. If the directory
   * structure does not exist, it is created.
   *
   * @param {String} src
   * @param {String} dest
   */
  static async ensureLink (src, dest) {
    return Fs.ensureLink(src, dest)
  }

  /**
   * Ensures that the symlink from source to
   * destination exists. If the directory
   * structure does not exist, it is created.
   *
   * @param {String} src
   * @param {String} dest
   * @param {String} type
   */
  static async ensureSymlink (src, dest, type = 'file') {
    return Fs.ensureSymlink(src, dest, type)
  }

  /**
   * Acquire a file lock on the specified `file` path.
   *
   * @param {String} file
   * @param {Object} options
   */
  static async lock (file, options = {}) {
    return lock(await this.prepareLockFile(file), options)
  }

  /**
   * Close and unlink the lockfile.
   *
   * @param {String} file
   */
  static async unlock (file) {
    return unlock(await this.prepareLockFile(file))
  }

  /**
   * Check if the lockfile is locked and not stale.
   *
   * @param {String} file
   * @param {Object} options
   *
   * @returns {Boolean}
   */
  static async isLocked (file, options = {}) {
    return isLocked(await this.prepareLockFile(file), options)
  }

  /**
   * Append the `.lock` suffix to the file name
   * if not existent.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  static async prepareLockFile (file = '') {
    return file.endsWith('.lock') ? file : `${file}.lock`
  }

  /**
   * Create a random temporary file path
   * you can write to.
   *
   * @param {Object} options
   */
  static async tempFile ({ extension = '', name } = {}) {
    return Tempy.file({ extension, name })
  }

  /**
   * Create a temporary directory path.
   * The directory is created for you.
   */
  static async tempDir () {
    return Tempy.directory()
  }

  /**
   * Returns the extension of `file`. For example,
   * returns `.html` for the HTML file located
   * at `/path/to/index.html`.
   *
   * @param {String} file
   */
  static async extension (file) {
    return Path.extname(file)
  }

  /**
   * Returns the trailing name component from a file path. For example,
   * returns `file.png` from the path `/home/user/file.png/`.
   *
   * @param {String} path
   * @param {String} extension
   *
   * @returns {String}
   */
  static async basename (path, extension) {
    return Path.basename(path, extension)
  }

  /**
   * Returns the file name without extension.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  static async filename (file) {
    return Path.parse(file).name
  }

  /**
   * Returns the directory name of the given `path`.
   * For example, a file path of `foo/bar/baz/file.txt`
   * returns `foo/bar/baz`.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  static async dirname (path) {
    return Path.dirname(path)
  }

  /**
   * Determines whether the given `path` is a file.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  static async isFile (path) {
    const stats = await this.stat(path)

    return stats.isFile()
  }

  /**
   * Determines whether the given `path` is a directory.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  static async isDirectory (path) {
    const stats = await this.stat(path)

    return stats.isDirectory()
  }
}

module.exports = Filesystem
