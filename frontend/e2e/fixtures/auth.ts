import { test as base, Page } from '@playwright/test';

interface KeycloakUser {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  realm_access: { roles: string[] };
}

/**
 * Intercepts the Vite-served keycloak-js module and replaces it with a mock
 * Keycloak class. This is the most reliable way to mock Keycloak in a
 * Vite ESM app because addInitScript runs too early to patch ESM imports.
 */
async function setupMockKeycloak(
  page: Page,
  options: { authenticated: boolean; user?: KeycloakUser },
) {
  const authenticated = options.authenticated;
  const tokenParsed = options.user ? JSON.stringify(options.user) : 'null';

  // Intercept the keycloak-js module served by Vite (pre-bundled in .vite/deps)
  await page.route(/keycloak-js/, (route) => {
    const mockModule = `
      class Keycloak {
        constructor() {
          this.authenticated = ${authenticated};
          this.token = ${authenticated ? '"mock-jwt-token"' : 'undefined'};
          this.tokenParsed = ${tokenParsed};
        }
        init() {
          this.authenticated = ${authenticated};
          this.token = ${authenticated ? '"mock-jwt-token"' : 'undefined'};
          this.tokenParsed = ${tokenParsed};
          return Promise.resolve(${authenticated});
        }
        login()       { return Promise.resolve(); }
        logout()      { return Promise.resolve(); }
        register()    { return Promise.resolve(); }
        updateToken() { return Promise.resolve(false); }
      }
      export { Keycloak as default };
    `;
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockModule,
    });
  });

  // Block real Keycloak / realm network calls
  await page.route('**/auth/realms/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );

  // Intercept silent-check-sso.html
  await page.route('**/silent-check-sso.html', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body></body></html>',
    }),
  );
}

export const buyerSellerUser: KeycloakUser = {
  sub: 'user-test-123',
  email: 'buyer@test.com',
  given_name: 'Jean',
  family_name: 'Testeur',
  realm_access: { roles: ['buyer', 'seller'] },
};

export const adminUser: KeycloakUser = {
  sub: 'admin-test-456',
  email: 'admin@collector.shop',
  given_name: 'Admin',
  family_name: 'Root',
  realm_access: { roles: ['buyer', 'seller', 'admin'] },
};

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  unauthenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  unauthenticatedPage: async ({ page }, use) => {
    await setupMockKeycloak(page, { authenticated: false });
    await use(page);
  },

  authenticatedPage: async ({ page }, use) => {
    await setupMockKeycloak(page, {
      authenticated: true,
      user: buyerSellerUser,
    });
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await setupMockKeycloak(page, {
      authenticated: true,
      user: adminUser,
    });
    await use(page);
  },
});

export { setupMockKeycloak };
export { expect } from '@playwright/test';
