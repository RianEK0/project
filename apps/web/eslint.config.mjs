import config from '../../packages/eslint-config/next.mjs';

export default [
  ...config,
  {
    ignores: ['public/sw.js'],
  },
];
