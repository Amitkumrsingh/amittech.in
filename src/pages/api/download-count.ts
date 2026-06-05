import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_PATH = join(process.cwd(), 'data')
const FILE = join(DATA_PATH, 'downloads.json')

async function readCount() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    const json = JSON.parse(raw)
    return Number(json.downloads || 0)
  } catch (err) {
    return 0
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false })
  const count = await readCount()
  res.status(200).json({ downloads: count })
}
