import { env } from '@arkstack/common'

/**
 * CDN delivery configuration for the `?cd` query param. When a request carries
 * `?cd`, the API skips runtime Sharp processing and instead resolves a jsDelivr
 * URL for the matching image in the `@pictwo/images` package (snapping requested
 * dimensions to the nearest pre-generated variant).
 */
export default () => {
    return {
        /** Master switch for `?cd` delivery. */
        enabled: env('CDN_ENABLED', true),

        /** npm package that ships the static images + manifest. */
        package: env('CDN_PACKAGE', '@pictwo/images'),

        /**
         * Package version used in the jsDelivr URL. When empty, the installed
         * `@pictwo/images` version is read at runtime.
         */
        version: env('CDN_VERSION', ''),

        /** jsDelivr (or compatible) CDN base. */
        baseUrl: env('CDN_BASE_URL', 'https://cdn.jsdelivr.net/npm'),
    }
}
