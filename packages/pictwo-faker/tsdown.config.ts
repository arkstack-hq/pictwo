import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  exports: true,
  deps: {
    neverBundle: ['@pictwo/core'],
  },
  outExtensions: () => ({
    js: '.mjs',
  }),
})
