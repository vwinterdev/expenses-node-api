import baseConfig from '@hono/eslint-config'

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-multiple-empty-lines': ['error', { max: 3 }],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]