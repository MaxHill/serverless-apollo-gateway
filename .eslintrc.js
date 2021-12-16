module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/prettier',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {}
    },
    typescript: {
      alwaysTryTypes: true
      // always try to resolve types under `<root>@types` directory even it does not contain any source code, like `@types/unist`
    }
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    'import/extensions': 'off'
  }
};
