import { expect, test } from '@playwright/test'

test.describe('portfolio smoke flow', () => {
  test('home, navigation, blog, article, skills, contact, and download API stay usable', async ({ page, request }) => {
    const runtimeFailures: string[] = []

    page.on('pageerror', error => runtimeFailures.push(`pageerror: ${error.message}`))
    page.on('console', message => {
      if (message.type() === 'error') runtimeFailures.push(`console error: ${message.text()}`)
    })
    page.on('response', response => {
      if (response.status() >= 500) runtimeFailures.push(`HTTP ${response.status()} ${response.url()}`)
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: /reliable systems and useful AI workflows/i })).toBeVisible()

    await page.getByRole('link', { name: 'AI' }).click()
    await expect(page.locator('#ai')).toBeVisible()
    await expect(page.getByRole('heading', { name: /CloudOps AI Copilot/i })).toBeVisible()

    await page.getByRole('link', { name: 'View Projects' }).click()
    await expect(page.locator('#projects')).toBeVisible()

    await page.getByRole('link', { name: 'Read Insights' }).click()
    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByRole('heading', { name: 'Ideas from systems that ship.' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Read featured article: The Kafka Mistake/i })).toBeVisible()

    await page.getByPlaceholder('Search stories').fill('Kafka')
    await expect(page.getByText(/stories/i).last()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Kafka/i }).first()).toBeVisible()

    await page.goto('/blog/kafka-mistake-duplicate-events-production', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/blog\/kafka-mistake-duplicate-events-production$/)
    await expect(page.getByRole('heading', { name: /The Kafka Mistake/i })).toBeVisible()
    await expect(page.locator('.reader-body')).toHaveCSS('max-width', 'none')
    await expect(page.locator('#production-notes').getByRole('heading', { name: 'Production Notes' })).toBeVisible()

    await page.goto('/#expertise', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Kafka' }).click()
    await expect(page.getByText(/Built streaming pipelines/i)).toBeVisible()

    await page.goto('/#contact', { waitUntil: 'networkidle' })
    await expect(page.getByRole('link', { name: 'Email me' })).toBeVisible()

    await page.goto('/admin', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Editorial workspace' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sign in to manage posts.' })).toBeVisible()

    const downloadCount = await request.get('/api/download-count')
    expect(downloadCount.ok()).toBe(true)
    expect(downloadCount.headers()['cache-control']).toContain('no-store')
    const payload = await downloadCount.json()
    expect(typeof payload.downloads).toBe('number')

    expect(runtimeFailures).toEqual([])
  })

  test('editorial theme defaults to light and remembers dark mode', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('.editorial-shell')).toHaveAttribute('data-theme', 'light')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('.editorial-shell')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('.editorial-shell')).toHaveAttribute('data-theme', 'dark')
  })

  test('mobile navigation opens without motion toggle overlap', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chrome', 'Mobile-only navigation check')

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible()
    await expect(page.getByTitle(/Animations on/i)).toBeHidden()
  })
})
