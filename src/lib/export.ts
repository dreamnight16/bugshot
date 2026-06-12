import i18next from 'i18next'
import type { Session, Pin, Drawing } from '../types'

const CROP_W = 160
const CROP_H = 100

interface PinContext {
  crop: string | null
  relX: string
  relY: string
  dominantColor: string
  bgColor: string
  isLightArea: boolean
}

async function analyzePinContext(img: HTMLImageElement, pin: Pin): Promise<PinContext> {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const relX = ((pin.x / w) * 100).toFixed(1)
  const relY = ((pin.y / h) * 100).toFixed(1)

  const canvas = document.createElement('canvas')
  canvas.width = CROP_W
  canvas.height = CROP_H
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { crop: null, relX, relY, dominantColor: 'N/A', bgColor: 'N/A', isLightArea: false }
  }

  const sx = Math.max(0, Math.round(pin.x) - CROP_W / 2)
  const sy = Math.max(0, Math.round(pin.y) - CROP_H / 2)
  const sw = Math.min(CROP_W, w - sx)
  const sh = Math.min(CROP_H, h - sy)

  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, CROP_W, CROP_H)
  const dx = Math.max(0, (CROP_W - sw) / 2)
  const dy = Math.max(0, (CROP_H - sh) / 2)
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh)

  // Sample colors BEFORE drawing crosshair
  const imageData = ctx.getImageData(0, 0, CROP_W, CROP_H)
  const pixels = imageData.data

  const cxInt = Math.floor(CROP_W / 2)
  const cyInt = Math.floor(CROP_H / 2)
  const ci = (cyInt * CROP_W + cxInt) * 4
  const centerColor = rgbToHex(pixels[ci], pixels[ci + 1], pixels[ci + 2])

  const samples = [
    { x: 5, y: 5 }, { x: CROP_W - 6, y: 5 },
    { x: 5, y: CROP_H - 6 }, { x: CROP_W - 6, y: CROP_H - 6 },
  ]
  let totalLuminance = 0
  for (const s of samples) {
    const i = (s.y * CROP_W + s.x) * 4
    const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    totalLuminance += lum
  }
  const avgLum = totalLuminance / samples.length
  const isLightArea = avgLum > 128

  let avgR = 0, avgG = 0, avgB = 0
  for (const s of samples) {
    const i = (s.y * CROP_W + s.x) * 4
    avgR += pixels[i]; avgG += pixels[i + 1]; avgB += pixels[i + 2]
  }
  avgR = Math.round(avgR / samples.length)
  avgG = Math.round(avgG / samples.length)
  avgB = Math.round(avgB / samples.length)
  const bgColor = rgbToHex(avgR, avgG, avgB)

  // Now draw crosshair on top
  const cx = CROP_W / 2
  const cy = CROP_H / 2
  ctx.strokeStyle = pin.color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy)
  ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.stroke()

  const crop = canvas.toDataURL('image/png')

  return { crop, relX, relY, dominantColor: centerColor, bgColor, isLightArea }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

async function analyzeAllPins(img: HTMLImageElement, pins: Pin[]): Promise<Map<string, PinContext>> {
  const results = new Map<string, PinContext>()
  for (const pin of pins) {
    results.set(pin.id, await analyzePinContext(img, pin))
  }
  return results
}

function typeLabel(type: string, t: (k: string) => string): string {
  switch (type) {
    case 'arrow': return t('export.arrow')
    case 'rectangle': return t('export.rectangle')
    case 'freehand': return t('export.freehand')
    default: return type
  }
}

export async function exportMarkdown(
  session: Session,
  pins: Pin[],
  drawings: Drawing[],
): Promise<string> {
  const t = i18next.t.bind(i18next)
  const img = new Image()
  img.src = session.screenshot

  return new Promise((resolve) => {
    img.onload = async () => {
      const contexts = await analyzeAllPins(img, pins)

      let md = `## ${t('export.feedbackTitle')}\n\n`
      md += `**${t('export.capturedAt')}**: ${new Date(session.capturedAt).toLocaleString()}\n`
      md += `**${t('export.window')}**: ${session.windowName}\n`
      md += `**${t('export.screenshotSize')}**: ${img.naturalWidth} × ${img.naturalHeight}\n\n`

      if (pins.length > 0) {
        for (const pin of pins) {
          const ctx = contexts.get(pin.id)
          const theme = ctx?.isLightArea ? t('export.lightArea') : t('export.darkArea')

          md += `### ${t('export.pin')} ${pin.number}\n`
          md += `- **${t('export.coordinates')}**: (${Math.round(pin.x)}, ${Math.round(pin.y)})`
          md += ` (${ctx?.relX ?? '?'}% L, ${ctx?.relY ?? '?'}% T)\n`

          if (pin.uia) {
            const parts: string[] = []
            if (pin.uia.name) parts.push(`"${pin.uia.name}"`)
            if (pin.uia.controlType) parts.push(pin.uia.controlType)
            if (pin.uia.className) parts.push(`class: ${pin.uia.className}`)
            if (pin.uia.automationId) parts.push(`#${pin.uia.automationId}`)
            if (parts.length > 0) {
              md += `- **${t('export.element')}**: ${parts.join(' ')}\n`
            }
            if (pin.uia.ancestors && pin.uia.ancestors.length > 0) {
              const crumbs = pin.uia.ancestors
                .filter(a => a.name || a.controlType !== 'Pane')
                .map(a => a.name ? `"${a.name}" ${a.controlType}` : a.controlType)
                .filter(s => s.length > 0 && s !== 'Pane')
              if (crumbs.length > 0) {
                md += `- **${t('export.path')}**: ${crumbs.join(' > ')}\n`
              }
            }
          }

          md += `- **${t('export.area')}**: ${theme}, ${t('export.background')} \`${ctx?.bgColor ?? '?'}\`, ${t('export.centerColor')} \`${ctx?.dominantColor ?? '?'}\`\n`

          if (pin.comment) {
            md += `- **${t('export.note')}**: ${pin.comment}\n`
          }

          if (ctx?.crop) {
            md += `\n![${t('export.area')}](${ctx.crop})\n`
          }

          md += '\n'
        }
      }

      if (drawings.length > 0) {
        md += `---\n\n### ${t('export.drawingAnnotations')}\n\n`
        for (const d of drawings) {
          const points = d.points.map(p => `(${Math.round(p.x)}, ${Math.round(p.y)})`).join(' → ')
          md += `- **${typeLabel(d.type, t)}** ${points}\n`
          if (d.comment) md += `  > ${d.comment}\n`
        }
      }

      md += '\n---\n'
      md += `*${pins.length + drawings.length} ${t('export.totalAnnotations').replace('{}', String(pins.length + drawings.length))}*\n`

      resolve(md)
    }
    img.onerror = () => {
      resolve(`## ${t('export.feedbackTitle')}\n\n*${t('export.loadFailed')}*\n`)
    }
  })
}

export function exportJSON(session: Session, pins: Pin[], drawings: Drawing[]): string {
  return JSON.stringify({
    id: session.id,
    windowName: session.windowName,
    capturedAt: session.capturedAt,
    pinCount: pins.length,
    drawingCount: drawings.length,
    pins: pins.map(p => ({
      number: p.number,
      x: Math.round(p.x),
      y: Math.round(p.y),
      comment: p.comment,
      color: p.color,
    })),
    drawings: drawings.map(d => ({
      type: d.type,
      points: d.points.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })),
      color: d.color,
      comment: d.comment || '',
    })),
  }, null, 2)
}
