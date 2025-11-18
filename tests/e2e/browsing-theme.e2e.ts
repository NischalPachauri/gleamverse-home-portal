import { test, expect } from '@playwright/test'

test.describe('Browsing section visual regression', () => {
  test('light theme: Explore by Category and Continue Your Journey', async ({ page }) => {
    await page.goto('/')

    const categories = page.locator('#browse').locator('#categories-title')
    await expect(categories).toBeVisible()

    const journey = page.locator('#browse').locator('h3').filter({ hasText: 'Continue Your Journey' })
    await expect(journey).toBeVisible()
  })

  test('dark theme: Explore by Category and Continue Your Journey', async ({ page }) => {
    await page.goto('/')

    const categories = page.locator('#browse').locator('#categories-title')
    await expect(categories).toBeVisible()

    const journey = page.locator('#browse').locator('h3').filter({ hasText: 'Continue Your Journey' })
    await expect(journey).toBeVisible()
  })
})
