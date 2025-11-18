import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'Enhance Browsing Section Design (Community)/**',
      'Book Reading Page Header (Community)/**',
      'Enhance Browsing Section Design/**',
      'Book Reading Page Header/**',
      '__tests__/**',
      'src/**/__tests__/**'
    ]
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-empty': 'error'
    }
  }
]