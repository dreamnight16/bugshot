import type { Session, Pin, Drawing } from '../types'
import { drawAllDrawings, drawAllPins } from './canvas'

export async function renderAnnotatedImage(
  session: Session,
  pins: Pin[],
  drawings: Drawing[],
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = session.screenshot
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(img, 0, 0)
      drawAllDrawings(ctx, drawings)
      drawAllPins(ctx, pins)

      resolve(canvas.toDataURL('image/png'))
    }
  })
}
