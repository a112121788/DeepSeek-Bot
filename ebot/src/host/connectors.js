// Connectors: outside services every Bot can use. Each one mounts its MCP
// tools through DSH's own MCP client on the plugin context, so every Bot and
// Session gets them as mcp__<id>__<tool>.
//
// The token is a named secret (secrets.js keeps it, redacts it, and offers it
// to the shell). It reaches the MCP server only in the request headers, built
// here in memory, never written to the DSH profile. A new token is shared with
// no Bot's shell: the tools do not need it there, and a Bot that reads a
// planted instruction in an issue could send it anywhere. The Secrets page can
// still share it. Signing in is `signIn` alone, so a browser login can take its
// place later without touching the mount.

export const GITHUB = 'github'
export const GITHUB_SECRET = 'GITHUB_TOKEN'
export const GITEE = 'gitee'
export const GITEE_SECRET = 'GITEE_TOKEN'
const MCP_CLIENT = '@deepseek-ai/dsh-mcp-client'
const CHECK_TIMEOUT_MS = 15_000

const CATALOG = {
  [GITHUB]: {
    id: GITHUB,
    name: 'GitHub',
    secret: GITHUB_SECRET,
    purpose: 'GitHub connector',
    configKey: 'github',
    defaults: {
      url: 'https://api.githubcopilot.com/mcp/',
      api: 'https://api.github.com',
      toolsets: 'context,repos,issues,pull_requests',
    },
    insecure: 'GitHub addresses must start with https://',
    unreachable: 'Could not reach GitHub',
    refused: 'GitHub did not accept this token',
    noLogin: 'GitHub did not say who this token belongs to',
    answered: status => `GitHub answered ${status}`,
    headers: (token, options) => ({
      Authorization: `Bearer ${token}`,
      'X-MCP-Toolsets': options.toolsets,
    }),
    userHeaders: token => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ebot',
      'X-GitHub-Api-Version': '2022-11-28',
    }),
  },
  [GITEE]: {
    id: GITEE,
    name: 'Gitee',
    secret: GITEE_SECRET,
    purpose: 'Gitee connector',
    configKey: 'gitee',
    defaults: {
      url: 'https://api.gitee.com/mcp',
      api: 'https://gitee.com/api/v5',
    },
    insecure: 'Gitee addresses must start with https://',
    unreachable: 'Could not reach Gitee',
    refused: 'Gitee did not accept this token',
    noLogin: 'Gitee did not say who this token belongs to',
    answered: status => `Gitee answered ${status}`,
    headers: token => ({ Authorization: `Bearer ${token}` }),
    userHeaders: token => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'User-Agent': 'ebot',
    }),
  },
}

// Asks the provider who the token belongs to. Any token it accepts passes.
export async function signIn(token, connector, { api, fetch: request = fetch } = {}) {
  const def = typeof connector === 'string' ? CATALOG[connector] : connector
  if (def === undefined) throw new Error('No such connector')
  const base = api ?? def.defaults.api
  let response
  try {
    response = await request(`${String(base).replace(/\/$/, '')}/user`, {
      headers: def.userHeaders(token),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    })
  } catch {
    throw new Error(def.unreachable)
  }
  if (response.status === 401) throw new Error(def.refused)
  if (!response.ok) throw new Error(def.answered(response.status))
  const user = await response.json().catch(() => ({}))
  if (typeof user?.login !== 'string') throw new Error(def.noLogin)
  return { login: user.login }
}

function optionsOf(rt, def) {
  const value = rt.config[def.configKey]
  if (value === false) return null
  return { ...def.defaults, ...(value && typeof value === 'object' ? value : {}) }
}

export function install(rt) {
  const { ctx, state } = rt
  const enabled = Object.values(CATALOG).flatMap(def => {
    const options = optionsOf(rt, def)
    if (options === null) return []
    const insecure = [options.url, options.api].some(address => !/^https:\/\//i.test(String(address)))
    return [{ def, options, insecure }]
  })
  const byId = new Map(enabled.map(entry => [entry.def.id, entry]))

  // `token` is what the current mount was made with, so a changed secret mounts again.
  const mounts = new Map()
  const statuses = new Map(enabled.map(({ def }) => [def.id, { state: 'off' }]))
  let queue = Promise.resolve()
  let stopped = false

  const unmount = async (id) => {
    const fiber = mounts.get(id)?.fiber
    mounts.delete(id)
    if (fiber !== undefined) await Promise.resolve().then(() => fiber.dispose()).catch(() => {})
  }

  // The MCP client wraps the server's answer (a 401, say) as the cause.
  const reason = (error) => {
    const text = [error, error?.cause].filter(Boolean).map(part => String(part?.message ?? part)).join(': ')
    return rt.redactSecrets(text || 'error').slice(0, 300)
  }

  async function reconcileOne(entry, force) {
    const { def, options, insecure } = entry
    const token = !stopped ? rt.secretValue(def.secret) : undefined
    const current = mounts.get(def.id)
    if (!force && current !== undefined && current.token === token) return
    await unmount(def.id)
    if (token === undefined) {
      statuses.set(def.id, { state: 'off' })
      return
    }
    if (insecure) {
      mounts.set(def.id, { token })
      statuses.set(def.id, { state: 'error', error: def.insecure })
      return
    }
    statuses.set(def.id, { state: 'connecting' })
    const loader = ctx.get?.('loader')
    if (typeof loader?.import !== 'function' || typeof ctx.plugin !== 'function') {
      mounts.set(def.id, { token })
      statuses.set(def.id, { state: 'error', error: 'This DSH cannot load connectors' })
      return
    }
    try {
      const exports = await loader.import(MCP_CLIENT)
      const plugin = loader.unwrapExports?.(exports) ?? exports?.default ?? exports
      const fiber = ctx.plugin(plugin, {
        transport: 'streamable-http',
        serverName: def.id,
        url: options.url,
        headers: def.headers(token, options),
        failOnStartupError: true,
      })
      mounts.set(def.id, { token, fiber })
      await fiber.await()
      if (mounts.get(def.id)?.fiber !== fiber) return
      statuses.set(def.id, { state: 'ready' })
    } catch (error) {
      await unmount(def.id)
      mounts.set(def.id, { token })
      const next = { state: 'error', error: reason(error) }
      statuses.set(def.id, next)
      rt.warn('ebot: %s connector failed: %s', def.name, next.error)
    }
  }

  // One change at a time; `force` connects again even when the token is the same.
  const sync = (force = false, id) => {
    const entries = id === undefined ? enabled : [byId.get(id)].filter(Boolean)
    queue = queue.then(async () => {
      for (const entry of entries) await reconcileOne(entry, force)
    }).catch(error => { rt.warn('ebot: connectors: %s', reason(error)) })
    return queue
  }

  const connectorsView = () => enabled.map(({ def }) => {
    const status = statuses.get(def.id) ?? { state: 'off' }
    return {
      id: def.id,
      name: def.name,
      state: status.state,
      ...(status.error !== undefined ? { error: status.error } : {}),
      account: rt.secretValue(def.secret) !== undefined ? state.connectors?.[def.id]?.login ?? null : null,
    }
  })

  const known = id => {
    const entry = byId.get(id)
    if (entry === undefined) throw new Error('No such connector')
    return entry
  }

  const endpoints = {
    async 'connector-connect'(body) {
      const entry = known(body.id)
      const { def, options, insecure } = entry
      const token = typeof body.token === 'string' ? body.token.trim() : ''
      if (token === '') throw new Error('Paste a token first')
      if (insecure) throw new Error(def.insecure)
      await rt.loadSecrets()
      const kept = rt.secretValue(def.secret) !== undefined
      const { login } = await signIn(token, def, { api: options.api })
      await rt.secretEndpoint('secret-set', { name: def.secret, value: token, purpose: def.purpose, ...(kept ? {} : { scope: [] }) })
      state.connectors = { ...state.connectors, [def.id]: { login, connectedAt: Date.now() } }
      await rt.save()
      await sync(false, def.id)
      return connectorsView()
    },
    async 'connector-disconnect'(body) {
      const { def } = known(body.id)
      await rt.loadSecrets()
      if (rt.secretValue(def.secret) !== undefined) await rt.secretEndpoint('secret-delete', { name: def.secret })
      if (state.connectors?.[def.id] !== undefined) {
        delete state.connectors[def.id]
        await rt.save()
      }
      await sync(false, def.id)
      return connectorsView()
    },
    async 'connector-retry'(body) {
      const { def } = known(body.id)
      await rt.loadSecrets()
      await sync(true, def.id)
      return connectorsView()
    },
  }

  const connectorEndpoint = (endpoint, body) => endpoints[endpoint](body ?? {})

  ctx.effect(() => {
    stopped = false
    void rt.loadSecrets().then(() => sync())
    return () => {
      stopped = true
      for (const id of [...mounts.keys()]) void unmount(id)
    }
  }, 'ebot: connectors')

  Object.assign(rt, { connectorsView, connectorEndpoint, secretsChanged: () => { void sync() } })
}
