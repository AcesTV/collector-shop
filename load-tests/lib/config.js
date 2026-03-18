export const BASE_URL = __ENV.BASE_URL || 'http://localhost';
export const API_URL = `${BASE_URL}/api`;

export const SERVICES = {
  users: __ENV.USER_SERVICE_URL || `${BASE_URL}:3001`,
  catalog: __ENV.CATALOG_SERVICE_URL || `${BASE_URL}:3002`,
  orders: __ENV.ORDER_SERVICE_URL || `${BASE_URL}:3003`,
  payments: __ENV.PAYMENT_SERVICE_URL || `${BASE_URL}:3004`,
  notifications: __ENV.NOTIFICATION_SERVICE_URL || `${BASE_URL}:3005`,
  chat: __ENV.CHAT_SERVICE_URL || `${BASE_URL}:3006`,
  fraud: __ENV.FRAUD_SERVICE_URL || `${BASE_URL}:3007`,
};

export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'],
  http_req_failed: ['rate<0.05'],
  http_reqs: ['rate>10'],
};

export const SMOKE = {
  vus: 1,
  duration: '30s',
};

export const LOAD = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export const STRESS = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 0 },
  ],
};

export const SPIKE = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '10s', target: 500 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 10 },
    { duration: '1m', target: 0 },
  ],
};

export function getScenarioConfig() {
  const profile = __ENV.LOAD_PROFILE || 'smoke';
  switch (profile) {
    case 'load':
      return LOAD;
    case 'stress':
      return STRESS;
    case 'spike':
      return SPIKE;
    case 'smoke':
    default:
      return SMOKE;
  }
}
