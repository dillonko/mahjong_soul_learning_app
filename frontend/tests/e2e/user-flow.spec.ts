import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e_${Date.now()}@test.com`;

test.describe('Registered User Flow', () => {
  test('should register, login, and access dashboard', async ({ page }) => {
    const email = uniqueEmail();

    // Step 1: Go to login page
    await page.goto('/login');

    // Step 2: Switch to register mode
    const toggleBtn = page.locator('button:has-text("Register"), a:has-text("Register"), .toggle-btn, [data-testid="toggle-register"]').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
    }

    // Step 3: Fill registration form
    await page.fill('input[type="email"], input[placeholder*="email" i]', email);
    await page.keyboard.press('Tab');
    await page.fill('input[type="password"], input[placeholder*="password" i]', 'password123');
    await page.keyboard.press('Tab');

    // Fill username if visible
    const usernameInput = page.locator('input[placeholder*="username" i], input[name="username"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('E2EUser');
      await page.keyboard.press('Tab');
    }

    // Step 4: Submit form
    await page.locator('button[type="submit"], button:has-text("Register")').last().click();

    // Step 5: Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should view progress page', async ({ page }) => {
    // Login as guest for simpler flow
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to progress
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should see progress page content
    await expect(page.locator('h1, h2, .progress-title').first()).toBeVisible({ timeout: 10000 });
  });

  test('should access settings page', async ({ page }) => {
    // Login as guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Should see settings content
    await expect(page.locator('text=Settings, text=Account, text=Logout').first()).toBeVisible({ timeout: 10000 });
  });
});
