module.exports = {
  env: {
    es2021: true,
    browser: false,
    mocha: true,
    node: true,
  },
  root: true,
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
  },
};
