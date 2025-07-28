/* eslint-env node */
'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    commonjs: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  globals: {
    // Node.js globals
    process: 'readonly',
    Buffer: 'readonly',
    console: 'readonly',
    // CommonJS
    require: 'readonly',
    module: 'writable',
    exports: 'writable',
    __filename: 'readonly',
    __dirname: 'readonly',
  },
  rules: {
    // Base rules
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off',
    'global-require': 'off',
    'class-methods-use-this': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
  },
  overrides: [
    {
      // Backend configuration
      files: ['backend/**/*.js'],
      env: {
        node: true,
        commonjs: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
      globals: {
        // Additional globals for backend
        server: 'readonly',
      },
    },
    {
      // Frontend configuration
      files: ['src/**/*.js', 'src/**/*.jsx'],
      env: {
        browser: true,
        es2021: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        // CommonJS (for webpack)
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
      },
    },
  ],
};
