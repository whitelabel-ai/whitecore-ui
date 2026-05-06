import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration — WhiteCore OS Template
 *
 * Agnóstica de framework frontend. Configurada para correr en CI (GitHub Actions)
 * y en desarrollo local.
 *
 * Requiere: npm install -D @playwright/test
 * Instalar browsers: npx playwright install
 */

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',

  /* Ejecutar tests en archivos en paralelo */
  fullyParallel: !isCI,

  /* Fallar build en CI si dejaste test.only */
  forbidOnly: isCI,

  /* Reintentos en CI, 0 en local para feedback rápido */
  retries: isCI ? 2 : 0,

  /* Workers: 1 en CI para determinismo, 4 en local */
  workers: isCI ? 1 : 4,

  /* Reporter */
  reporter: isCI ? 'line' : [['html', { open: 'never' }]],

  /* Shared settings para todos los proyectos */
  use: {
    /* Base URL para navegación relativa: await page.goto('/dashboard') */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Coleccionar trace solo en primer reintento */
    trace: 'on-first-retry',

    /* Screenshot solo en fallo */
    screenshot: 'only-on-failure',

    /* Video solo en fallo */
    video: 'retain-on-failure',
  },

  /* Proyectos: Chromium, Firefox, WebKit */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Servidor local para auto-levantar en desarrollo (opcional) */
  webServer: isCI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
