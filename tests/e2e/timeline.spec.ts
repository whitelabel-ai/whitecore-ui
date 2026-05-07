import { test, expect } from '@playwright/test';

test('company_admin puede ver timeline después de guardar área', async ({ page }) => {
  test.setTimeout(60000);
  const uniqueId = Date.now();
  const companyName = `Timeline Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@timeline.com`;
  const password = 'test-password-e2e';

  // 1. Registro
  await page.goto('/register');
  await page.getByLabel(/nombre de la empresa/i).fill(companyName);
  await page.getByLabel(/nombre del administrador/i).fill('Admin Test');
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /crear cuenta/i }).click();

  // 2. Login
  await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });

  // 3. Completar área
  await page.goto('/dashboard/diagnostic/strategy');
  await page.getByPlaceholder(/descripción del problema/i).fill('Falta de visión estratégica');
  await page.getByRole('combobox').first().selectOption('high');
  await page.getByPlaceholder(/oportunidades/i).fill('Nuevos mercados');
  await page.getByTestId('area-notes').fill('Prioridad Q1');
  await page.getByRole('button', { name: /guardar contexto/i }).click();

  await expect(page).toHaveURL(/.*dashboard\/diagnostic.*/, { timeout: 10000 });

  // 4. Ir a timeline
  await page.goto('/dashboard/timeline');
  await expect(page.getByRole('heading', { name: /timeline de hallazgos/i })).toBeVisible();
  await expect(page.getByText(/creó el contexto de estrategia & negocio/i)).toBeVisible();
  await expect(page.getByText('Admin Test')).toBeVisible();
});
