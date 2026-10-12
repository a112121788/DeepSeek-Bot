// Browser storage keys for this install.
export const STORAGE = {
  unread: 'ebot:unread',
  reactions: 'ebot:reactions',
  seen: 'ebot:seen',
  prefs: 'ebot:prefs',
  surface: 'ebot:surface',
  agentSessions: 'ebot:agent-sessions',
  browserWidth: 'ebot:browser-width',
  browsers: 'ebot.browser.v2',
}

// The saved theme only paints the first frame before the team loads; it follows the
// host's rename of the theme ids.
const LEGACY_THEMES = { grok: 'mono' }

export function migrateStorage(storage = globalThis.localStorage) {
  try {
    const prefs = JSON.parse(storage.getItem(STORAGE.prefs) ?? 'null')
    if (prefs && Object.hasOwn(LEGACY_THEMES, prefs.theme ?? '')) {
      storage.setItem(STORAGE.prefs, JSON.stringify({ ...prefs, theme: LEGACY_THEMES[prefs.theme] }))
    }
  } catch { /* storage unavailable or not JSON */ }
}
