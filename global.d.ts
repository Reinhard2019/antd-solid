declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.svg?raw' {
  const content: string
  export default content
}

interface ColorSelectionOptions {
  signal?: AbortSignal
}

interface ColorSelectionResult {
  sRGBHex: string
}

interface EyeDropper {
  open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>
}

interface EyeDropperConstructor {
  new (): EyeDropper
}

interface Window {
  EyeDropper?: EyeDropperConstructor | undefined
}
