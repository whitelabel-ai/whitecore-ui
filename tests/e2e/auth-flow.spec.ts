import { test, expect } from '@playwright/test';

test('flujo completo: registro de empresa, login y acceso al dashboard', async ({ page }) => {
  const uniqueId = Date.now();
  const companyName = `Acme Diagnóstico ${uniqueId}`;
  const adminEmail = `juan${uniqueId}@acme-diag.com`;
  const password = 'SecurePass123!';

  // 1. Ir a registro
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: /registrar empresa/i })).toBeVisible();

  // 2. Completar formulario
  await page.getByLabel(/nombre de la empresa/i).fill(companyName);
  await page.getByLabel(/nombre del administrador/i).fill('Juan Pérez');
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);

  // 3. Enviar formulario
  await page.getByRole('button', { name: /crear cuenta/i }).click();

  // 4. Debería redirigir a login
  await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

  // 5. Hacer login
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  // 6. Debería redirigir a dashboard
  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });
  await expect(page.getByText(companyName)).toBeVisible();
});
