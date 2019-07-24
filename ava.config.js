export default {
  failFast: true,
  require: ['./test/pretest-setup.js'],
  files: [
    'test/**/*.js',
    '!test/pretest-setup.js'
  ],
  helpers: [
    '**/helpers/**/*',
    '**/fixtures/**/*'
  ]
}
