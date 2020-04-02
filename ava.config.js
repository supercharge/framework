export default {
  failFast: true,
  require: ['./test/pretest-setup.js'],
  files: [
    'test/**/*.js',
    '!test/pretest-setup.js',
    '!test/**/fixtures/**/*'
  ]
}
