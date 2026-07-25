import { PaginatedResult } from '../types/index.js';

let authToken = localStorage.getItem('educore_token') || '';
let currentTenantHeader = localStorage.getItem('educore_tenant_id') || '';

export function setAuthToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem('educore_token', token);
  } else {
    localStorage.removeItem('educore_token');
  }
}

export function setTenantContext(tenantId: string) {
  currentTenantHeader = tenantId;
  if (tenantId) {
    localStorage.setItem('educore_tenant_id', tenantId);
  } else {
    localStorage.removeItem('educore_tenant_id');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<{ success: boolean; message?: string; data?: T; meta?: PaginatedResult<T>['meta'] }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (currentTenantHeader) {
    headers['x-tenant-id'] = currentTenantHeader;
  }

  const response = await fetch(`/api/v1${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await response.json();

  if (!response.ok && !json.message) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json;
}
