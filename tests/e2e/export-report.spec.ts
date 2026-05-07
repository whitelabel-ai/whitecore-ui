import { test, expect } from '@playwright/test';

test('company_admin puede ver informe imprimible y descargar JSON', async ({ page }) => {
  test.setTimeout(60000);
  const uniqueId = Date.now();
  const companyName = `Report Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@report.com`;
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
  await page.getByPlaceholder(/descripción del problema/i).fill('Falta de visión');
  await page.getByRole('combobox').first().selectOption('high');
  await page.getByPlaceholder(/oportunidades/i).fill('Nuevos mercados');
  await page.getByTestId('area-notes').fill('Prioridad Q1');
  await page.getByRole('button', { name: /guardar contexto/i }).click();

  await expect(page).toHaveURL(/.*dashboard\/diagnostic.*/, { timeout: 10000 });

  // 4. Ir a resumen y ver botones de exportación
  await page.goto('/dashboard/summary');
  await expect(page.getByRole('heading', { name: /resumen ejecutivo/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /descargar json/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /ver informe imprimible/i })).toBeVisible();

  // 5. Ir al informe imprimible
  await page.getByRole('link', { name: /ver informe imprimible/i }).click();
  await expect(page).toHaveURL(/.*dashboard\/report.*/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /informe de diagnóstico empresarial/i })).toBeVisible();
  await expect(page.getByText(companyName)).toBeVisible();
  await expect(page.getByText('Falta de visión')).toBeVisible();
  await expect(page.getByText('Nuevos mercados')).toBeVisible();
});
