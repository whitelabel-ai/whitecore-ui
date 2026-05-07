import { test, expect } from '@playwright/test';

test('company_admin puede ver resumen ejecutivo después de completar áreas', async ({ page }) => {
  test.setTimeout(60000);
  const uniqueId = Date.now();
  const companyName = `Summary Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@summary.com`;
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

  // 3. Completar área de estrategia con problemas
  await page.goto('/dashboard/diagnostic/strategy');
  await page.getByPlaceholder(/descripción del problema/i).fill('Sin plan estratégico');
  await page.getByRole('combobox').first().selectOption('critical');
  await page.getByPlaceholder(/oportunidades/i).fill('Crecimiento orgánico');
  await page.getByTestId('area-notes').fill('Revisar en Q4');
  await page.getByRole('button', { name: /guardar contexto/i }).click();

  await expect(page).toHaveURL(/.*dashboard\/diagnostic.*/, { timeout: 10000 });

  // 4. Ir a resumen ejecutivo
  await page.goto('/dashboard/summary');
  await expect(page.getByRole('heading', { name: /resumen ejecutivo/i })).toBeVisible();

  // 5. Verificar métricas
  await expect(page.getByText('1 / 8')).toBeVisible();
  await expect(page.getByText('Score General')).toBeVisible();
  await expect(page.locator('p.text-3xl').filter({ hasText: '75' }).first()).toBeVisible(); // score general

  // 6. Verificar problemas prioritarios
  await expect(page.getByText('Sin plan estratégico')).toBeVisible();
});

test('company_admin no puede acceder al dashboard de consultora', async ({ page }) => {
  test.setTimeout(60000);
  const uniqueId = Date.now();
  const companyName = `NoAdmin Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@noadmin.com`;
  const password = 'test-password-e2e';

  await page.goto('/register');
  await page.getByLabel(/nombre de la empresa/i).fill(companyName);
  await page.getByLabel(/nombre del administrador/i).fill('Admin Test');
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /crear cuenta/i }).click();

  await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });

  // Intentar acceder a admin/dashboard
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });
});
