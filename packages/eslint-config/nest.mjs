import { baseConfig } from './base.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
];

