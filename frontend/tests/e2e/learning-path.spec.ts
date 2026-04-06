import { test, expect } from '@playwright/test';

test.describe('Learning Path Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display modules on dashboard', async ({ page }) => {
    // Dashboard should list learning modules
    await page.waitForLoadState('networkidle');
    const moduleCards = page.locator('.module-card, .card, [class*="module"]');
    await expect(moduleCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to a module page', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on first module link
    const moduleLink = page.locator('a[href*="/modules/"]').first();
    if (await moduleLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moduleLink.click();
      await page.waitForLoadState('networkidle');

      // Should be on a module page
      await expect(page.url()).toContain('/modules/');
    }
  });

  test('should navigate between learning resources', async ({ page }) => {
    // Navigate through main sections
    const sections = ['/dashboard', '/keywords', '/strategies', '/progress'];

    for (const section of sections) {
      await page.goto(section);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(section);
    }
  });
});
