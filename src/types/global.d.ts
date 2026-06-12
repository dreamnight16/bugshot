export {}

declare global {
  interface Window {
    electronAPI?: {
      onScreenshot: (callback: (data: { screenshot: string; windowName: string }) => void) => void
      captureScreen: (mode: 'fullscreen' | 'region' | 'window') => void
      captureRegion: (bounds: { x: number; y: number; width: number; height: number }) => void
      cancelRegion: () => void
      startRegionCapture: () => void
      getScreenshot: () => Promise<{ screenshot: string; windowName: string; pins: string; drawings: string } | null>
      copyToClipboard: (text: string) => void
      saveScreenshot: (dataUrl: string) => void
      saveJson: (json: string) => void
      getAnnotations: () => Promise<unknown>
      updateAnnotations: (sessionJson: string) => void
      resolveAnnotation: (id: string) => void
      queryUIA: (x: number, y: number) => Promise<{
        name: string
        controlType: string
        className: string
        automationId: string
        helpText: string
        isEnabled: boolean
        ancestors: { name: string; controlType: string; className: string }[]
        error?: string
      }>
      getCaptureOffset: () => Promise<{ x: number; y: number }>
      minimizeWindow: () => void
      closeWindow: () => void
    }
  }
}
