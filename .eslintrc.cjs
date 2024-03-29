module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['solid'],
  extends: ['standard-with-typescript', 'plugin:solid/typescript', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external', 'internal']],
      },
    ],
    'no-shadow': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    ],
    '@typescript-eslint/comma-dangle': ['error', 'only-multiline'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    quotes: 'off',
    '@typescript-eslint/quotes': 'error',
    'no-template-curly-in-string': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
}
