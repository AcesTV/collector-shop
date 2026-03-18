import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const apiDuration = new Trend('api_duration', true);

export function checkResponse(res, name, expectedStatus = 200) {
  const passed = check(res, {
    [`${name} - status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} - response time < 1s`]: (r) => r.timings.duration < 1000,
  });

  errorRate.add(!passed);
  apiDuration.add(res.timings.duration);

  return passed;
}

export function jsonHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { headers };
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function thinkTime(min = 0.5, max = 2) {
  sleep(min + Math.random() * (max - min));
}

export function getAuthToken() {
  const keycloakUrl = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
  const realm = __ENV.KEYCLOAK_REALM || 'collector';
  const clientId = __ENV.KEYCLOAK_CLIENT_ID || 'collector-frontend';
  const username = __ENV.TEST_USERNAME || 'testuser';
  const password = __ENV.TEST_PASSWORD || 'testpassword';

  const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

  const res = http.post(tokenUrl, {
    grant_type: 'password',
    client_id: clientId,
    username: username,
    password: password,
  });

  if (res.status === 200) {
    return JSON.parse(res.body).access_token;
  }

  console.warn(`Auth failed (status ${res.status}): ${res.body}`);
  return null;
}
