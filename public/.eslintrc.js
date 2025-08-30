// ESLint configuration for service worker
module.exports = {
  env: {
    serviceworker: true,
    browser: true,
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
};
