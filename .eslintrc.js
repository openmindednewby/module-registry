/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', project: './tsconfig.json' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2020: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    'no-console': 'error',
    'eqeqeq': ['error', 'always'],
    'no-restricted-syntax': ['error', { selector: 'TSEnumDeclaration:not([const=true])', message: 'Use const enum.' }],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '**/*.test.ts'],
};
