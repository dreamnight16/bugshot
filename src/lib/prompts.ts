import i18next from 'i18next'
import type { Pin, Drawing, Session } from '../types'

const t = i18next.t.bind(i18next)

function buildPinList(pins: Pin[], drawings: Drawing[]): string {
  let text = ''
  for (const pin of pins) {
    text += `- **${t('export.pin')} ${pin.number}**: (${Math.round(pin.x)}, ${Math.round(pin.y)})`
    if (pin.comment) text += ` — ${pin.comment}`
    text += '\n'
  }
  for (const d of drawings) {
    const typeLabel =
      d.type === 'arrow' ? t('export.arrow')
      : d.type === 'rectangle' ? t('export.rectangle')
      : t('export.freehand')
    text += `- **${typeLabel}**: ${d.points.map(p => `(${Math.round(p.x)},${Math.round(p.y)})`).join(' → ')}`
    if (d.comment) text += ` — ${d.comment}`
    text += '\n'
  }
  return text
}

export function buildFixPrompt(_session: Session, pins: Pin[], drawings: Drawing[]): string {
  const pinList = buildPinList(pins, drawings)
  return `${t('prompts.fixTitle')}

${pinList}
${t('prompts.fixReq1')}
${t('prompts.fixReq2')}
${t('prompts.fixReq3')}`
}

export function buildStyleFixPrompt(_session: Session, pins: Pin[], drawings: Drawing[]): string {
  const pinList = buildPinList(pins, drawings)
  return `${t('prompts.styleTitle')}

${pinList}
${t('prompts.styleReq1')}
${t('prompts.styleReq2')}
${t('prompts.styleReq3')}`
}

export function buildLayoutFixPrompt(_session: Session, pins: Pin[], drawings: Drawing[]): string {
  const pinList = buildPinList(pins, drawings)
  return `${t('prompts.layoutTitle')}

${pinList}
${t('prompts.layoutReq1')}
${t('prompts.layoutReq2')}
${t('prompts.layoutReq3')}`
}
