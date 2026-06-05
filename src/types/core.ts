export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif'

export type ResizeMode =
    | { mode: 'scale'; width?: number; height?: number }
    | { mode: 'cover'; width: number; height: number }   // crop to fit, minimal pixel loss
    | { mode: 'contain'; width: number; height: number } // letterbox within bounds
    | { mode: 'fill'; width: number; height: number }    // stretch to exact dimensions

export type ImageFilter =
    | 'greyscale'
    | 'blur'
    | 'sharpen'
    | 'negate'
    | 'normalize'
    | 'flip'
    | 'flop'

export interface MakeOptions {
    label?: string
    format?: ImageFormat
    quality?: number
    resize?: ResizeMode
    filters?: ImageFilter[]
    blurSigma?: number  // only used when 'blur' filter is included
}