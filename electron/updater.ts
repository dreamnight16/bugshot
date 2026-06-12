import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { logger } from './logger'

export function initAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.logger = logger
  autoUpdater.autoDownload = false

  autoUpdater.on('update-available', (info) => {
    logger.info(`Update available: ${info.version}`)
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    logger.debug('No update available')
  })

  autoUpdater.on('error', (err) => {
    logger.error('Auto-update error', err)
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded')
  })

  // Check every 4 hours
  autoUpdater.checkForUpdatesAndNotify().catch(() => {
    logger.debug('Update check skipped')
  })

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 4 * 60 * 60 * 1000)
}
