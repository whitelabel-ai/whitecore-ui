import { test, expect } from '@playwright/test';

test('la página principal carga correctamente', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Create Next App|Company Context/);
});

test('navegación básica es responsive', async ({ page }) => {
  await page.goto('/');
  // Verificar que el body está presente (smoke test mínimo)
  await expect(page.locator('body')).toBeVisible();
});
