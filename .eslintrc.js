module.exports = {
  plugins: ['jest'],
  env: { 'jest/globals': true, browser: true, commonjs: true, es2021: true },
  extends: ['eslint:recommended', 'standard'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'space-before-function-paren': 'off'
  }
}
