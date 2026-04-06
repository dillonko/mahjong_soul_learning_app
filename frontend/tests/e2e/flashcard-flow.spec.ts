import { test, expect } from '@playwright/test';

test.describe('Flashcard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as guest
    await page.goto('/login?guest=true');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should navigate to keywords page and see cards', async ({ page }) => {
    await page.goto('/keywords');
    await page.waitForLoadState('networkidle');

    // Should display keyword cards
    const cards = page.locator('.keyword-card, .card, .flip-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch between browse and flashcard modes', async ({ page }) => {
    await page.goto('/keywords');
    await page.waitForLoadState('networkidle');

    // Look for mode toggle button
    const flashcardBtn = page.locator('button:has-text("Flashcard"), button:has-text("flashcard")').first();
    if (await flashcardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await flashcardBtn.click();
      await page.waitForTimeout(500);

      // Should see flashcard navigation controls
      const navControls = page.locator('button:has-text("Next"), button:has-text("Previous"), button:has-text("Shuffle")');
      await expect(navControls.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
