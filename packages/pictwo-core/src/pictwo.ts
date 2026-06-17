import { DEFAULT_PICTWO_HOST, DEFAULT_SIZE_PRESETS } from './presets'
import { HostedProvider } from './providers/hosted'
import { JsDelivrProvider } from './providers/jsdelivr'
import { LocalProvider } from './providers/local'
import { createImageApi } from './image'
import type { ImageApi } from './image'
import type { PictwoConfig, PictwoSource, SizePresets } from './types'
import type { Provider, ProviderContext } from './providers/types'

export interface Pictwo {
  image: ImageApi
  readonly config: ResolvedPictwoConfig
}

export interface ResolvedPictwoConfig {
  source: PictwoSource
  sizePresets: SizePresets
  manifest?: PictwoConfig['manifest']
}

function makeProvider (source: PictwoSource): Provider {
  switch (source.driver) {
    case 'hosted':
      return new HostedProvider(source.baseUrl ?? DEFAULT_PICTWO_HOST)
    case 'jsdelivr':
      return new JsDelivrProvider(source.packageName, source.version, source.baseUrl, source.assetDir)
    case 'local':
      return new LocalProvider(source.baseUrl)
    default:
      throw new Error(`[pictwo] Unknown source driver "${(source as { driver: string }).driver}".`)
  }
}

/**
 * Create a configured Pictwo instance. With no config it targets the live
 * hosted ArkStack API at {@link DEFAULT_PICTWO_HOST}.
 */
export function createPictwo (config: PictwoConfig = {}): Pictwo {
  const resolved: ResolvedPictwoConfig = {
    source: config.source ?? { driver: 'hosted', baseUrl: DEFAULT_PICTWO_HOST },
    sizePresets: { ...DEFAULT_SIZE_PRESETS, ...config.sizePresets },
    manifest: config.manifest,
  }

  const provider = makeProvider(resolved.source)
  const ctx: ProviderContext = {
    presets: resolved.sizePresets,
    manifest: resolved.manifest,
  }

  return {
    image: createImageApi(provider, ctx),
    config: resolved,
  }
}

/** Default instance bound to the hosted ArkStack Pictwo API. */
export const pictwo: Pictwo = createPictwo()
