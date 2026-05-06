import { test, expect } from '@playwright/test';

test('company_admin puede invitar usuarios y ver listado', async ({ page }) => {
  const uniqueId = Date.now();
  const companyName = `Invite Corp ${uniqueId}`;
  const adminEmail = `admin${uniqueId}@invite.com`;
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

  // 3. Ir a gestión de usuarios
  await page.goto('/dashboard/users');
  await expect(page.getByRole('heading', { name: /gestión de usuarios/i })).toBeVisible();

  // 4. Invitar nuevo usuario
  const newUserEmail = `user${uniqueId}@invite.com`;
  await page.getByTestId('invite-name').fill('Nuevo Usuario');
  await page.getByTestId('invite-email').fill(newUserEmail);
  await page.getByTestId('invite-password').fill('test-password-invited');
  await page.getByRole('button', { name: /invitar usuario/i }).click();

  // 5. Verificar que aparece en la tabla
  await expect(page.getByText('Nuevo Usuario')).toBeVisible();
  await expect(page.getByText(newUserEmail)).toBeVisible();
  await expect(page.getByText('company_user')).toBeVisible();
});
