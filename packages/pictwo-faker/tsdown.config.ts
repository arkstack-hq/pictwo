import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  // @pictwo/core is a published workspace dependency — keep it external.
  external: ['@pictwo/core'],
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.mjs' : '.cjs',
  }),
})
