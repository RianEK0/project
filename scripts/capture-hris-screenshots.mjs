import { mkdir, writeFile, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const frontendBaseUrl = 'http://127.0.0.1:4173'
const outputDir = '/Users/arian/Enterprise HRIS (Human Resource Information System)/screenshots'
const userDataDir = '/private/tmp/chrome-hris-devtools'
const remoteDebugPort = 9222

const session = JSON.parse(process.env.HRIS_SESSION_JSON ?? 'null')

if (!session) {
  throw new Error('HRIS_SESSION_JSON is required.')
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${remoteDebugPort}/json/version`)

      if (response.ok) {
        return
      }
    } catch {
      // Ignore until Chrome is ready.
    }

    await delay(250)
  }

  throw new Error('Chrome remote debugger did not start in time.')
}

async function createTarget(url) {
  const response = await fetch(`http://127.0.0.1:${remoteDebugPort}/json/new?${encodeURIComponent(url)}`, {
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error(`Failed to create target for ${url}.`)
  }

  return response.json()
}

async function closeTarget(targetId) {
  await fetch(`http://127.0.0.1:${remoteDebugPort}/json/close/${targetId}`)
}

class DevToolsClient {
  constructor(url) {
    this.url = url
    this.socket = null
    this.id = 0
    this.pending = new Map()
    this.eventWaiters = new Map()
  }

  async connect() {
    this.socket = new WebSocket(this.url)

    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })

    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data)

      if (typeof payload.id === 'number') {
        const pending = this.pending.get(payload.id)

        if (!pending) {
          return
        }

        this.pending.delete(payload.id)

        if (payload.error) {
          pending.reject(new Error(payload.error.message))
          return
        }

        pending.resolve(payload.result)
        return
      }

      const waiters = this.eventWaiters.get(payload.method)

      if (!waiters || waiters.length === 0) {
        return
      }

      const next = waiters.shift()
      next?.(payload.params)
    })
  }

  send(method, params = {}) {
    const id = ++this.id

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  waitFor(method) {
    return new Promise((resolve) => {
      const waiters = this.eventWaiters.get(method) ?? []
      waiters.push(resolve)
      this.eventWaiters.set(method, waiters)
    })
  }

  async close() {
    if (!this.socket) {
      return
    }

    this.socket.close()
    await delay(150)
  }
}

async function capturePage(path, width, height) {
  const target = await createTarget(`${frontendBaseUrl}/login`)
  const client = new DevToolsClient(target.webSocketDebuggerUrl)

  await client.connect()

  try {
    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })

    await client.waitFor('Page.loadEventFired')
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('enterprise-hris.session', ${JSON.stringify(JSON.stringify(session))});
        window.location.href = ${JSON.stringify(`${frontendBaseUrl}${path}`)};
      `,
    })

    await client.waitFor('Page.loadEventFired')
    await delay(1800)

    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
    })

    return screenshot.data
  } finally {
    await client.close()
    await closeTarget(target.id)
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  await rm(userDataDir, { recursive: true, force: true })

  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${remoteDebugPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )

  chrome.stdout.on('data', () => {})
  chrome.stderr.on('data', () => {})

  try {
    await waitForDebugger()

    const targets = [
      {
        path: '/dashboard',
        name: 'dashboard.png',
        width: 1440,
        height: 1200,
      },
      {
        path: '/employees',
        name: 'employees.png',
        width: 1440,
        height: 1300,
      },
      {
        path: '/organization',
        name: 'organization.png',
        width: 1440,
        height: 1400,
      },
      {
        path: '/leave',
        name: 'leave.png',
        width: 1440,
        height: 1500,
      },
    ]

    for (const target of targets) {
      const screenshot = await capturePage(target.path, target.width, target.height)
      await writeFile(`${outputDir}/${target.name}`, Buffer.from(screenshot, 'base64'))
    }
  } finally {
    chrome.kill('SIGTERM')
    await rm(userDataDir, { recursive: true, force: true })
  }
}

await main()
