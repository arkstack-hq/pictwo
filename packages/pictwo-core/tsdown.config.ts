import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  exports: true,
  sourcemap: false,
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.mjs' : '.cjs',
  }),
})
