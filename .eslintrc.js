module.exports = {
  root: true,
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'react/prop-types': 'off',
  },
  env: {
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
