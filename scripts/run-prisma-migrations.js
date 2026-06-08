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
const result = spawnSync(command, ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' })

process.exit(result.status || 0)
