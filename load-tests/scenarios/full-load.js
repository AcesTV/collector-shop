import http from 'k6/http';
import { group, sleep } from 'k6';
import { SERVICES, THRESHOLDS } from '../lib/config.js';
import {
  checkResponse,
  jsonHeaders,
  getAuthToken,
  randomItem,
  thinkTime,
} from '../lib/helpers.js';

/**
 * Full mixed-scenario load test simulating realistic traffic patterns.
 *
 * Scenario distribution (mirrors real user behavior):
 *   70% - Anonymous catalog browsing
 *   15% - Authenticated order flow
 *   10% - Notification checks
 *    5% - Profile management
 */
export const options = {
  scenarios: {
    catalog_browsing: {
      executor: 'ramping-vus',
      exec: 'catalogBrowsing',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 70 },
        { duration: '3m', target: 70 },
        { duration: '1m', target: 0 },
      ],
    },
    order_flow: {
      executor: 'ramping-vus',
      exec: 'orderFlow',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '3m', target: 15 },
        { duration: '1m', target: 0 },
      ],
    },
    notification_checks: {
      executor: 'ramping-vus',
      exec: 'notificationChecks',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
    },
    profile_management: {
      executor: 'ramping-vus',
      exec: 'profileManagement',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 5 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{scenario:catalog_browsing}': ['p(95)<800'],
    'http_req_duration{scenario:order_flow}': ['p(95)<2000'],
    'http_req_duration{scenario:notification_checks}': ['p(95)<500'],
    'http_req_duration{scenario:profile_management}': ['p(95)<1000'],
  },
};

const searchTerms = [
  'figurine', 'manga', 'carte', 'pokemon', 'collector',
  'rare', 'vintage', 'marvel', 'star wars', 'dragon ball',
];

export function setup() {
  const token = getAuthToken();
  if (!token) {
    console.warn('Could not obtain auth token – authenticated scenarios will be skipped');
  }
  return { token };
}

// ─── Scenario 1: Catalog browsing (anonymous) ────────────────────

export function catalogBrowsing() {
  group('Catalog - Categories', () => {
    const res = http.get(`${SERVICES.catalog}/categories`);
    checkResponse(res, 'Categories');
    thinkTime(1, 3);
  });

  group('Catalog - Products', () => {
    const res = http.get(`${SERVICES.catalog}/products`);
    checkResponse(res, 'Products');

    if (res.status === 200) {
      try {
        const products = JSON.parse(res.body);
        const items = Array.isArray(products) ? products : products.data || [];
        if (items.length > 0) {
          const product = randomItem(items);
          thinkTime(2, 5);

          group('Catalog - Product detail', () => {
            const detailRes = http.get(`${SERVICES.catalog}/products/${product.id}`);
            checkResponse(detailRes, 'Product detail');
          });
        }
      } catch (_) {}
    }
    thinkTime(2, 4);
  });

  if (Math.random() > 0.5) {
    group('Catalog - Search', () => {
      const term = randomItem(searchTerms);
      const res = http.get(`${SERVICES.catalog}/products?search=${encodeURIComponent(term)}`);
      checkResponse(res, 'Search');
      thinkTime(2, 4);
    });
  }
}

// ─── Scenario 2: Order flow (authenticated) ──────────────────────

export function orderFlow(data) {
  const { token } = data;
  if (!token) { sleep(5); return; }

  const headers = jsonHeaders(token);

  const productsRes = http.get(`${SERVICES.catalog}/products`, headers);
  let productIds = [];

  if (productsRes.status === 200) {
    try {
      const products = JSON.parse(productsRes.body);
      const items = Array.isArray(products) ? products : products.data || [];
      productIds = items.filter((p) => p.status === 'approved').map((p) => p.id);
    } catch (_) {}
  }

  if (productIds.length === 0) { thinkTime(3, 5); return; }

  thinkTime(2, 4);

  group('Order - Create', () => {
    const payload = JSON.stringify({
      items: [{ productId: randomItem(productIds), quantity: 1 }],
    });
    const res = http.post(`${SERVICES.orders}`, payload, headers);
    checkResponse(res, 'Create order', 201);
    thinkTime(1, 3);
  });

  group('Order - My orders', () => {
    const res = http.get(`${SERVICES.orders}/buyer/mine`, headers);
    checkResponse(res, 'My orders');
    thinkTime(2, 4);
  });
}

// ─── Scenario 3: Notification checks (authenticated) ─────────────

export function notificationChecks(data) {
  const { token } = data;
  if (!token) { sleep(5); return; }

  const headers = jsonHeaders(token);

  group('Notifications - Unread count', () => {
    const res = http.get(`${SERVICES.notifications}/unread-count`, headers);
    checkResponse(res, 'Unread count');
    thinkTime(1, 2);
  });

  group('Notifications - List', () => {
    const res = http.get(`${SERVICES.notifications}/mine`, headers);
    checkResponse(res, 'List notifications');
    thinkTime(3, 6);
  });
}

// ─── Scenario 4: Profile management (authenticated) ──────────────

export function profileManagement(data) {
  const { token } = data;
  if (!token) { sleep(5); return; }

  const headers = jsonHeaders(token);

  group('Profile - Get', () => {
    const res = http.get(`${SERVICES.users}/me`, headers);
    checkResponse(res, 'Get profile');
    thinkTime(3, 6);
  });

  group('Profile - Update', () => {
    const payload = JSON.stringify({
      displayName: `LoadTest_${Date.now()}`,
    });
    const res = http.put(`${SERVICES.users}/me`, payload, headers);
    checkResponse(res, 'Update profile');
    thinkTime(2, 4);
  });
}
