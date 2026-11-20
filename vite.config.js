import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['testsuite/unit/**/*.test.js'],
  },
})
