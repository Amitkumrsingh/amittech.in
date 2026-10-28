const { spawnSync } = require('child_process')

if (process.env.PRISMA_MIGRATE_ON_BUILD !== 'true') {
  console.log('Skipping Prisma migrations during build.')
  process.exit(0)
}

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL is not configured; skipping Prisma migrations.')
  process.exit(0)
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const retryCount = Math.min(Math.max(Number(process.env.PRISMA_MIGRATE_RETRIES || 3), 1), 5)
let result

for (let attempt = 1; attempt <= retryCount; attempt += 1) {
  result = spawnSync(command, ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' })
  if (result.status === 0) break

  if (attempt < retryCount) {
    const delayMs = 3000 * attempt
    console.warn(`Prisma migration attempt ${attempt} failed; retrying in ${delayMs}ms.`)
    spawnSync(process.execPath, ['-e', `setTimeout(() => {}, ${delayMs})`], { stdio: 'ignore' })
  }
}

process.exit(result?.status || 1)
