import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
// import viteConfig from './vite.config'

export default defineConfig({
  plugins: [
    solid(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    deps: {
      inline: [/solid-js/, /solid-testing-library/],
    },
    typecheck: {
      tsconfig: './tsconfig.json'
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
})
