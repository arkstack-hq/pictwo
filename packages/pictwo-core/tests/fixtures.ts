import type { ImageManifest } from '../src'

export const manifest: ImageManifest = {
  version: 1,
  categories: {
    fashion: {
      original: ['model-001.jpg', 'model-002.jpg', 'model-003.jpg'],
      variants: {
        '400x400': ['model-001.webp', 'model-002.webp', 'model-003.webp'],
        '128x128': ['model-001.webp', 'model-002.webp', 'model-003.webp'],
      },
    },
    fabric: {
      original: ['weave-001.jpg', 'weave-002.jpg'],
      variants: {
        '400x400': ['weave-001.webp'],
      },
    },
  },
}
