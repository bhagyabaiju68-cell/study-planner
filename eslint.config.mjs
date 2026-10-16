import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'coverage/', 'public/app.js'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  stylistic.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: ts.parser,
      globals: {
        ...globals.node,
      },
    },
    files: ['**/*.ts'],
    rules: {
      // eslint rules
      // no importing more than once from the same file
      'no-duplicate-imports': 'error',
      // me when i forgor to backtick
      'no-template-curly-in-string': 'error',
      // no variables used before assignment
      'no-unassigned-vars': 'error',
      // no infinite loops
      'no-unmodified-loop-condition': 'error',
      // no one run time loops
      'no-unreachable-loop': 'error',
      // no unused assignments
      'no-useless-assignment': 'error',
      // use === instead of ==
      'eqeqeq': 'error',
      // camelcase for variable names
      'camelcase': 'error',
      // prefer const over let
      'prefer-const': ['error', { destructuring: 'all' }],

      // @typescript-eslint rules
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false, variables: false }],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all',
      }],

      // stylistic rules
      // enforce semicolon use
      '@stylistic/semi': ['error', 'always', { omitLastInOneLineBlock: true }],
      // use single quotes
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
      // use semicolon delimiter
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      }],
      // dangling commas
      '@stylistic/comma-dangle': ['error', {
        arrays: 'only-multiline',
        objects: 'only-multiline',
        imports: 'only-multiline',
        exports: 'only-multiline',
        enums: 'only-multiline',
        functions: 'never',
      }],
      // allow if else { on same line
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
  },
  {
    // the web page runs in the browser, not node
    files: ['src/frontend/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
