import http from 'k6/http';
import { group } from 'k6';
import { SERVICES, THRESHOLDS, getScenarioConfig } from '../lib/config.js';
import {
  checkResponse,
  jsonHeaders,
  getAuthToken,
  thinkTime,
} from '../lib/helpers.js';

const scenarioConfig = getScenarioConfig();

export const options = {
  ...scenarioConfig,
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:user_profile}': ['p(95)<500'],
    'http_req_duration{endpoint:update_profile}': ['p(95)<1000'],
  },
};

export function setup() {
  const token = getAuthToken();
  if (!token) {
    console.warn('Could not obtain auth token – user tests will run unauthenticated');
  }
  return { token };
}

export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = jsonHeaders(token);

  group('Get user profile', () => {
    const res = http.get(`${SERVICES.users}/me`, {
      ...headers,
      tags: { endpoint: 'user_profile' },
    });
    checkResponse(res, 'Get profile');
    thinkTime(2, 5);
  });

  group('Update user profile', () => {
    const payload = JSON.stringify({
      displayName: `LoadTestUser_${Date.now()}`,
    });

    const res = http.put(`${SERVICES.users}/me`, payload, {
      ...headers,
      tags: { endpoint: 'update_profile' },
    });

    checkResponse(res, 'Update profile');
    thinkTime(3, 6);
  });

  group('Get profile again (verify update)', () => {
    const res = http.get(`${SERVICES.users}/me`, {
      ...headers,
      tags: { endpoint: 'user_profile' },
    });
    checkResponse(res, 'Verify profile update');
    thinkTime(1, 2);
  });
}
