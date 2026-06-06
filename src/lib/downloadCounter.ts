import { promises as fs } from 'fs'
import { join } from 'path'

type CounterStorage = 'redis' | 'file' | 'memory'

type CounterResult = {
  downloads: number
  storage: CounterStorage
}

const DATA_PATH = join(process.cwd(), 'data')
const FILE = join(DATA_PATH, 'downloads.json')
const COUNTER_KEY = process.env.DOWNLOAD_COUNTER_KEY || 'resume:downloads'

declare global {
  // eslint-disable-next-line no-var
  var __resumeDownloadCount: number | undefined
}

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

async function redisCommand<T>(command: string, ...args: string[]): Promise<T | null> {
  const config = getRedisConfig()
  if (!config) return null

  const path = [command, ...args].map(part => encodeURIComponent(part)).join('/')
  const res = await fetch(`${config.url}/${path}`, {
    headers: {
      Authorization: `Bearer ${config.token}`
    },
    cache: 'no-store'
  })

  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`)
  const json = await res.json()
  return json.result as T
}

async function readFileCount() {
  const raw = await fs.readFile(FILE, 'utf-8')
  const json = JSON.parse(raw)
  return Number(json.downloads || 0)
}

async function writeFileCount(downloads: number) {
  await fs.mkdir(DATA_PATH, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify({ downloads }, null, 2), 'utf-8')
}

function readMemoryCount() {
  return Number(globalThis.__resumeDownloadCount || 0)
}

function writeMemoryCount(downloads: number) {
  globalThis.__resumeDownloadCount = downloads
}

export async function getDownloadCount(): Promise<CounterResult> {
  try {
    const redisCount = await redisCommand<string | number | null>('get', COUNTER_KEY)
    if (redisCount !== null) return { downloads: Number(redisCount || 0), storage: 'redis' }
  } catch (err) {
    console.warn('download counter redis read failed', err)
  }

  try {
    const downloads = await readFileCount()
    writeMemoryCount(downloads)
    return { downloads, storage: 'file' }
  } catch (err) {
    return { downloads: readMemoryCount(), storage: 'memory' }
  }
}

export async function incrementDownloadCount(): Promise<CounterResult> {
  try {
    const redisCount = await redisCommand<number>('incr', COUNTER_KEY)
    if (redisCount !== null) return { downloads: Number(redisCount || 0), storage: 'redis' }
  } catch (err) {
    console.warn('download counter redis increment failed', err)
  }

  try {
    const current = await readFileCount().catch(() => readMemoryCount())
    const downloads = current + 1
    await writeFileCount(downloads)
    writeMemoryCount(downloads)
    return { downloads, storage: 'file' }
  } catch (err) {
    const downloads = readMemoryCount() + 1
    writeMemoryCount(downloads)
    return { downloads, storage: 'memory' }
  }
}
