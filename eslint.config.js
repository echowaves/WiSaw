const { FlatCompat } = require('@eslint/eslintrc')

/* eslint-disable no-undef */
/* global require, module, __dirname */

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  {
    ignores: ['eslint.config.js'],
  },
  ...compat.config({
    extends: ['airbnb-base', 'prettier'],
    env: {
      browser: true,
      es6: true,
      es2021: true,
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
    },
  }),
  {
    files: ['**/eslint.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
]
