// The toast for actions that fail away from any form (menus, the palette), and
// `whenText` for short timestamps shared with the About page.
import { createElement as h, useEffect, useState } from 'react'
import { dateLocale, t } from './i18n.js'
import { CloseIcon } from './icons.js'
import { SPRING_SHAPE } from './motion.js'

export function whenText(time) {
  const date = new Date(time)
  const today = new Date().toDateString() === date.toDateString()
  const clock = date.toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' })
  return today ? clock : `${date.toLocaleDateString(dateLocale(), { month: 'short', day: 'numeric' })} ${clock}`
}

const TOAST_MS = 6000

// One failure at a time, bottom center; a newer one replaces it.
export function ErrorToast({ useUi, actions }) {
  const toast = useUi(state => state.toast)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (!toast) return undefined
    setLeaving(false)
    const fade = setTimeout(() => setLeaving(true), TOAST_MS)
    const gone = setTimeout(() => actions.dismissToast(toast.token), TOAST_MS + 200)
    return () => { clearTimeout(fade); clearTimeout(gone) }
  }, [toast?.token])
  if (!toast) return null
  return h('div', { className: 'bt-toast', role: 'alert', 'data-leaving': leaving || undefined },
    h('span', { className: 'bt-toast-text' }, toast.text),
    h('button', { type: 'button', className: 'bt-icon-btn bt-toast-close', 'aria-label': t('Dismiss'), onClick: () => actions.dismissToast(toast.token) }, h(CloseIcon)))
}

export const FEEDBACK_CSS = `
.bt-toast{position:fixed;left:50%;bottom:28px;z-index:1000;display:flex;align-items:center;gap:8px;max-width:min(560px,calc(100vw - 32px));padding:8px 8px 8px 14px;border-radius:12px;background:var(--bt-card,#fff);color:var(--bt-ink,#141414);border:1px solid var(--bt-line-2,rgba(0,0,0,.15));box-shadow:0 8px 28px rgba(0,0,0,.14);font-size:13px;line-height:18px;transform:translateX(-50%);animation:bt-toast-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-toast[data-leaving]{opacity:0;transform:translate(-50%,6px) scale(.98);filter:blur(3px);transition:opacity .18s ease-in,transform .18s ease-in,filter .18s ease-in}
.bt-toast-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.bt-toast-text::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#e02135;margin:0 8px 1px 0}
.bt-toast-close{flex:none}
@keyframes bt-toast-in{from{transform:translate(-50%,16px) scale(.94)}}
@media (prefers-reduced-motion:reduce){.bt-toast{animation:none}.bt-toast[data-leaving]{transition:none}}
`
