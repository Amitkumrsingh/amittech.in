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
    await expect(page.getByRole('heading', { name: /reliable distributed systems/i })).toBeVisible()

    await page.getByRole('link', { name: 'View Projects' }).click()
    await expect(page.locator('#projects')).toBeVisible()

    await page.getByRole('link', { name: 'Read Insights' }).click()
    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByRole('heading', { name: 'Engineering Notes' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Read featured article: The Kafka Mistake/i })).toBeVisible()

    await page.getByPlaceholder('Kafka, scaling, RAG...').fill('Kafka')
    await expect(page.getByText(/notes matched/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Kafka/i }).first()).toBeVisible()

    await page.goto('/blog/kafka-mistake-duplicate-events-production', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/blog\/kafka-mistake-duplicate-events-production$/)
    await expect(page.getByRole('heading', { name: /The Kafka Mistake/i })).toBeVisible()
    await expect(page.locator('#production-notes').getByRole('heading', { name: 'Production Notes' })).toBeVisible()

    await page.goto('/#expertise', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Kafka' }).click()
    await expect(page.getByText(/Built streaming pipelines/i)).toBeVisible()

    await page.goto('/#contact', { waitUntil: 'networkidle' })
    await expect(page.getByRole('link', { name: 'Email me' })).toBeVisible()

    const downloadCount = await request.get('/api/download-count')
    expect(downloadCount.ok()).toBe(true)
    expect(downloadCount.headers()['cache-control']).toContain('no-store')
    const payload = await downloadCount.json()
    expect(typeof payload.downloads).toBe('number')

    expect(runtimeFailures).toEqual([])
  })

  test('mobile navigation opens without motion toggle overlap', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chrome', 'Mobile-only navigation check')

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible()
    await expect(page.getByTitle(/Animations on/i)).toBeHidden()
  })
})
