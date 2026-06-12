import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, dialog, Tray, Menu, screen, desktopCapturer, nativeImage } from 'electron'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { startMCPServer, stopMCPServer, updateSessionState } from './mcp-server'
import { getElementAtPoint, formatUIAInfo, UIAInfo } from './uia'
import { logger } from './logger'
import { initAutoUpdater } from './updater'

let mainWindow: BrowserWindow | null = null
let regionWindow: BrowserWindow | null = null
let tray: Tray | null = null
let currentSession: {
  screenshot: string
  windowName: string
  pins: string
  drawings: string
} | null = null
let lastCaptureOffset = { x: 0, y: 0 }

const DATA_DIR = join(app.getPath('home'), '.uipin')
const ANNOTATIONS_FILE = join(DATA_DIR, 'annotations.json')

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#09090b',
    title: 'UIPin',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function getCaptureSize() {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.size
  const scale = display.scaleFactor
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

async function captureFullscreen(): Promise<{ screenshot: string; windowName: string }> {
  lastCaptureOffset = { x: 0, y: 0 }
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: getCaptureSize(),
  })
  const primarySource = sources[0]
  const screenshot = primarySource.thumbnail.toDataURL()
  return {
    screenshot,
    windowName: 'Full Screen',
  }
}

function logicalToPhysical(val: number): number {
  return Math.round(val * screen.getPrimaryDisplay().scaleFactor)
}

function createRegionWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  regionWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    }
  })

  regionWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
    <head><style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { width:100vw;height:100vh;cursor:crosshair;background:rgba(0,0,0,0.25); }
      #rect { position:absolute;border:2px dashed #3b82f6;background:rgba(59,130,246,0.1);display:none; }
    </style></head>
    <body>
      <div id="rect"></div>
      <script>
        const rect=document.getElementById('rect');
        let sx=0,sy=0;
        document.addEventListener('mousedown',e=>{sx=e.clientX;sy=e.clientY;rect.style.display='block';});
        document.addEventListener('mousemove',e=>{
          if(e.buttons!==1)return;
          const l=Math.min(sx,e.clientX),t=Math.min(sy,e.clientY);
          const w=Math.abs(e.clientX-sx),h=Math.abs(e.clientY-sy);
          rect.style.left=l+'px';rect.style.top=t+'px';
          rect.style.width=w+'px';rect.style.height=h+'px';
        });
        document.addEventListener('mouseup',e=>{
          const l=Math.min(sx,e.clientX),t=Math.min(sy,e.clientY);
          const w=Math.abs(e.clientX-sx),h=Math.abs(e.clientY-sy);
          window.electronAPI?.captureRegion({x:l,y:t,width:w,height:h});
        });
        document.addEventListener('keydown',e=>{if(e.key==='Escape')window.electronAPI?.cancelRegion();});
      </script>
    </body>
    </html>
  `)

  regionWindow.setFullScreen(true)
}

async function captureRegion(bounds: { x: number; y: number; width: number; height: number }): Promise<{ screenshot: string; windowName: string }> {
  const scale = screen.getPrimaryDisplay().scaleFactor
  lastCaptureOffset = { x: Math.round(bounds.x), y: Math.round(bounds.y) }
  if (regionWindow) {
    regionWindow.close()
    regionWindow = null
  }

  if (bounds.width < 10 || bounds.height < 10) {
    return captureFullscreen()
  }

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: getCaptureSize(),
  })

  const primarySource = sources[0]
  const fullImage = primarySource.thumbnail

  const cropped = fullImage.crop({
    x: Math.round(bounds.x * scale),
    y: Math.round(bounds.y * scale),
    width: Math.round(bounds.width * scale),
    height: Math.round(bounds.height * scale),
  })

  return {
    screenshot: cropped.toDataURL(),
    windowName: `Region (${Math.round(bounds.x)}, ${Math.round(bounds.y)})`,
  }
}

async function captureWindow(): Promise<{ screenshot: string; windowName: string }> {
  lastCaptureOffset = { x: 0, y: 0 }
  const sources = await desktopCapturer.getSources({
    types: ['window'],
    thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
  })
  const windowSource = sources.find(s => s.name !== 'UIPin') || sources[0]
  return {
    screenshot: windowSource.thumbnail.toDataURL(),
    windowName: windowSource?.name || 'Window',
  }
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+P', async () => {
    const data = await captureFullscreen()
    sendCaptureToRenderer(data)
  })

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    createRegionWindow()
  })

  globalShortcut.register('CommandOrControl+Shift+W', async () => {
    const data = await captureWindow()
    sendCaptureToRenderer(data)
  })
}

function sendCaptureToRenderer(data: { screenshot: string; windowName: string }) {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('screenshot-captured', data)
  }
}

function setupIPC() {
  ipcMain.on('capture-screen', async (_event, mode: string) => {
    if (mode === 'region') {
      createRegionWindow()
      return
    }
    const data = mode === 'window'
      ? await captureWindow()
      : await captureFullscreen()
    sendCaptureToRenderer(data)
  })

  ipcMain.on('capture-region', async (_event, bounds) => {
    const data = await captureRegion(bounds)
    if (mainWindow) {
      mainWindow.webContents.send('screenshot-captured', data)
    }
  })

  ipcMain.on('cancel-region', () => {
    if (regionWindow) {
      regionWindow.close()
      regionWindow = null
    }
  })

  ipcMain.handle('get-screenshot', async () => {
    return currentSession
  })

  ipcMain.on('copy-to-clipboard', (_event, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.on('save-screenshot', async (_event, dataUrl: string) => {
    if (!mainWindow) return
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '保存标注截图',
      defaultPath: `uipin-${Date.now()}.png`,
      filters: [{ name: 'PNG Image', extensions: ['png'] }]
    })
    if (filePath) {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      writeFileSync(filePath, Buffer.from(base64, 'base64'))
    }
  })

  ipcMain.on('save-json', async (_event, json: string) => {
    if (!mainWindow) return
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '保存标注数据',
      defaultPath: `uipin-${Date.now()}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (filePath) {
      writeFileSync(filePath, json, 'utf-8')
    }
  })

  ipcMain.on('update-annotations', (_event, sessionJson: string) => {
    ensureDataDir()
    writeFileSync(ANNOTATIONS_FILE, sessionJson, 'utf-8')
    currentSession = JSON.parse(sessionJson)
    updateSessionState(currentSession)
  })

  ipcMain.handle('get-annotations', () => {
    try {
      if (existsSync(ANNOTATIONS_FILE)) {
        return JSON.parse(readFileSync(ANNOTATIONS_FILE, 'utf-8'))
      }
    } catch { /* ignore */ }
    return null
  })

  ipcMain.on('resolve-annotation', (_event, id: string) => {
    try {
      if (existsSync(ANNOTATIONS_FILE)) {
        const session = JSON.parse(readFileSync(ANNOTATIONS_FILE, 'utf-8'))
        session.status = 'resolved'
        writeFileSync(ANNOTATIONS_FILE, JSON.stringify(session, null, 2), 'utf-8')
        currentSession = session
        updateSessionState(currentSession)
      }
    } catch { /* ignore */ }
  })

  ipcMain.handle('query-uia', async (_event, x: number, y: number) => {
    const sf = screen.getPrimaryDisplay().scaleFactor
    const screenX = Math.round(x / sf) + lastCaptureOffset.x
    const screenY = Math.round(y / sf) + lastCaptureOffset.y
    return getElementAtPoint(screenX, screenY)
  })

  ipcMain.handle('get-capture-offset', () => {
    return lastCaptureOffset
  })

  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-close', () => {
    mainWindow?.hide()
  })
}

function createTray() {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  try {
    let icon: Electron.NativeImage
    if (existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath)
    } else {
      icon = nativeImage.createEmpty()
    }
    tray = new Tray(icon)
  } catch {
    return
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '截取全屏 (Ctrl+Shift+P)',
      click: async () => {
        const data = await captureFullscreen()
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          mainWindow.webContents.send('screenshot-captured', data)
        }
      }
    },
    {
      label: '区域截取 (Ctrl+Shift+R)',
      click: () => createRegionWindow()
    },
    {
      label: '打开 UIPin',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        stopMCPServer()
        app.quit()
      }
    }
  ])

  tray.setToolTip('UIPin')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.whenReady().then(() => {
  logger.info('UIPin starting...')
  ensureDataDir()
  startMCPServer()
  createWindow()
  setupIPC()
  registerShortcuts()
  createTray()
  if (mainWindow) initAutoUpdater(mainWindow)
  logger.info('UIPin ready')
})

app.on('window-all-closed', () => {
  // Don't quit on window close, keep running in tray
})

app.on('will-quit', () => {
  logger.info('UIPin shutting down...')
  globalShortcut.unregisterAll()
  stopMCPServer()
})

app.on('activate', () => {
  if (!mainWindow) {
    createWindow()
  } else {
    mainWindow.show()
  }
})
