import type { Session, Pin, Drawing } from '../types'
import { drawAllDrawings, drawAllPins } from './canvas'

export async function renderAnnotatedImage(
  session: Session,
  pins: Pin[],
  drawings: Drawing[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas rendering is unavailable')

        ctx.drawImage(img, 0, 0)
        drawAllDrawings(ctx, drawings)
        drawAllPins(ctx, pins)

        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('Screenshot failed to load'))
    img.src = session.screenshot
  })
}
