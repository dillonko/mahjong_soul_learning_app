import { test, expect } from '@playwright/test';

test.describe('Guest User Flow', () => {
  test('should navigate from home to guest mode and view modules', async ({ page }) => {
    // Step 1: Visit home page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Mahjong Soul Academy');

    // Step 2: Click "Try as Guest" or navigate to login with guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Step 3: Should see dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should browse keywords as guest', async ({ page }) => {
    // Login as guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to keywords
    await page.goto('/keywords');
    await page.waitForLoadState('networkidle');

    // Should see keyword content
    await expect(page.locator('.keyword-card, .card').first()).toBeVisible({ timeout: 10000 });
  });

  test('should browse strategies as guest', async ({ page }) => {
    // Login as guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to strategies
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle');

    // Should see strategy content
    await expect(page.locator('.strategy-card, .card').first()).toBeVisible({ timeout: 10000 });
  });
});
