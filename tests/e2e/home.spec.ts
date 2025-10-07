/**
 * E2E Tests for Home Page
 * Run with: npx playwright test
 *
 * Install Playwright first:
 * npm install -D @playwright/test
 * npx playwright install
 */

import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display login card when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Should show sign in prompt
    await expect(page.getByText('Sign in to see and control your devices')).toBeVisible()

    // Should have sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should display entities when authenticated', async ({ page }) => {
    // Note: This test requires setting up auth state
    // You'll need to create a setup script to handle Supabase auth

    await page.goto('http://localhost:3000')

    // Assuming logged in state
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await expect(page.getByText('Devices')).toBeVisible()
  })
})

test.describe('Entity Controls', () => {
  test.skip('should search entities', async ({ page }) => {
    // Set up auth state first
    await page.goto('http://localhost:3000')

    // Type in search box
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('living room')

    // Verify filtered results
    await expect(page.getByText(/showing/i)).toBeVisible()
  })

  test.skip('should filter by domain', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Click lights filter
    await page.getByRole('button', { name: 'light' }).click()

    // Verify only lights shown
    await expect(page.getByText(/showing/i)).toBeVisible()
  })

  test.skip('should toggle entity', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Find a toggleable entity
    const toggleButton = page.getByRole('button', { name: /turn on|turn off/i }).first()
    const initialText = await toggleButton.textContent()

    // Click toggle
    await toggleButton.click()

    // Wait for state change
    await expect(toggleButton).not.toHaveText(initialText || '')
  })

  test.skip('should enable auto-refresh', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const refreshButton = page.getByRole('button', { name: /auto-refresh/i })

    // Initially off
    await expect(refreshButton).toHaveText(/off/i)

    // Toggle on
    await refreshButton.click()
    await expect(refreshButton).toHaveText(/on/i)
  })
})

test.describe('API Health', () => {
  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('checks')
  })

  test('metrics endpoint should return stats', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/metrics')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('uptime')
    expect(body).toHaveProperty('endpoints')
  })
})
