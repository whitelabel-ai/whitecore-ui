import { test, expect } from '@playwright/test';

test('company_admin puede completar contexto de un área', async ({ page }) => {
  test.setTimeout(60000);
  const uniqueId = Date.now();
  const companyName = `Diag Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@diag.com`;
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

  // 3. Ir a diagnóstico
  await page.goto('/dashboard/diagnostic');
  await expect(page.getByRole('heading', { name: /diagnóstico empresarial/i })).toBeVisible();

  // 4. Hacer click en una área
  await page.getByText(/Estrategia & Negocio/i).click();
  await expect(page).toHaveURL(/.*dashboard\/diagnostic\/strategy.*/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Estrategia & Negocio/i })).toBeVisible();

  // 5. Completar formulario
  await page.getByPlaceholder(/descripción del problema/i).fill('Falta de dirección estratégica clara');
  await page.getByRole('combobox').first().selectOption('critical');
  await page.getByPlaceholder(/oportunidades/i).fill('Expansión internacional');
  await page.getByTestId('area-notes').fill('Revisar con board en Q3');

  await page.getByRole('button', { name: /guardar contexto/i }).click();

  // 6. Debería redirigir al resumen y mostrar completado
  await expect(page).toHaveURL(/.*dashboard\/diagnostic.*/, { timeout: 10000 });
  await expect(page.getByText('1 / 8')).toBeVisible();
});
