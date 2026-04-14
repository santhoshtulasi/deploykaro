import { test, expect } from '@playwright/test';

// Helper to wait for navigation and element stability
test.describe('Interview Mode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/interview');
    await expect(page).toHaveURL(/\/interview/);
  });

  test('complete a short interview flow', async ({ page }) => {
    // Setup: select experience and duration
    await page.getByRole('button', { name: /Intermediate/ }).click();
    await page.getByRole('button', { name: /Quick Mode/ }).click();
    await page.getByRole('button', { name: /Start .* Interview/i }).click();

    // Ensure session started and first question appears
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Answer the question
    await textarea.fill('I would implement blue-green deployments because it allows zero-downtime updates. In this scenario, I would deploy the new version to the green environment, perform health checks, and then route traffic. This is the best approach.');
    await page.getByRole('button', { name: /Submit/ }).click();

    // Wait for debrief badge
    const badge = page.locator('text=✅').first();
    await expect(badge).toBeVisible();

    // Move to next question (repeat for a few questions)
    for (let i = 0; i < 9; i++) {
      await page.getByRole('button', { name: /Next Question/ }).click();
      const q = page.locator('textarea');
      await q.waitFor({ state: 'visible' });
      await q.fill('I would implement blue-green deployments because it allows zero-downtime updates. In this scenario, I would deploy the new version to the green environment, perform health checks, and then route traffic. This is the best approach.');
      await page.getByRole('button', { name: /Submit/ }).click();
      await expect(page.locator('text=✅').first()).toBeVisible();
    }

    // Finish interview and view summary
    await page.getByRole('button', { name: /See Results/ }).click();
    await expect(page.locator('text=Interview Ready')).toBeVisible();
    await expect(page.locator('text=Score')).toBeVisible();
  });
});
