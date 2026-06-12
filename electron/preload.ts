import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  onScreenshot: (callback: (data: { screenshot: string; windowName: string }) => void) => {
    ipcRenderer.on('screenshot-captured', (_event, data) => callback(data))
  },
  captureScreen: (mode: 'fullscreen' | 'region' | 'window') => {
    ipcRenderer.send('capture-screen', mode)
  },
  captureRegion: (bounds: { x: number; y: number; width: number; height: number }) => {
    ipcRenderer.send('capture-region', bounds)
  },
  cancelRegion: () => {
    ipcRenderer.send('cancel-region')
  },
  startRegionCapture: () => {
    ipcRenderer.send('start-region-capture')
  },
  getScreenshot: async (): Promise<{ screenshot: string; windowName: string; pins: string; drawings: string }> => {
    return ipcRenderer.invoke('get-screenshot')
  },
  copyToClipboard: (text: string) => {
    ipcRenderer.send('copy-to-clipboard', text)
  },
  saveScreenshot: (dataUrl: string) => {
    ipcRenderer.send('save-screenshot', dataUrl)
  },
  saveJson: (json: string) => {
    ipcRenderer.send('save-json', json)
  },
  getAnnotations: async () => {
    return ipcRenderer.invoke('get-annotations')
  },
  updateAnnotations: (sessionJson: string) => {
    ipcRenderer.send('update-annotations', sessionJson)
  },
  resolveAnnotation: (id: string) => {
    ipcRenderer.send('resolve-annotation', id)
  },
  queryUIA: async (x: number, y: number) => {
    return ipcRenderer.invoke('query-uia', x, y)
  },
  getCaptureOffset: async () => {
    return ipcRenderer.invoke('get-capture-offset')
  },
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize')
  },
  closeWindow: () => {
    ipcRenderer.send('window-close')
  }
}

contextBridge.exposeInMainWorld('electronAPI', Object.freeze(electronAPI))

export type ElectronAPI = typeof electronAPI
