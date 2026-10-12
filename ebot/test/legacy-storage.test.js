import assert from 'node:assert/strict'
import { test } from 'node:test'
import { STORAGE, migrateStorage } from '../src/client/storage.js'

const memoryStorage = (entries = {}) => {
  const map = new Map(Object.entries(entries))
  return {
    map,
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    removeItem: (key) => { map.delete(key) },
  }
}

test('a saved grok theme becomes the mono theme', () => {
  const storage = memoryStorage({ 'ebot:prefs': '{"theme":"grok","accent":"#123456"}' })
  migrateStorage(storage)
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE.prefs)), { theme: 'mono', accent: '#123456' })
})

test('keys already saved stay, and unusable storage is no error', () => {
  const storage = memoryStorage({ 'ebot:seen': 'current', 'dsh-bot:seen': 'old' })
  migrateStorage(storage)
  assert.equal(storage.getItem(STORAGE.seen), 'current')
  assert.equal(storage.getItem('dsh-bot:seen'), 'old')
  const broken = { getItem: () => { throw new Error('denied') }, setItem() {}, removeItem() {} }
  assert.doesNotThrow(() => migrateStorage(broken))
  migrateStorage(memoryStorage({ 'ebot:prefs': 'not json' }))
})
