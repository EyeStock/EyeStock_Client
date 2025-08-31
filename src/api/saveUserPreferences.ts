import {API_BASE_URL} from '@env';

export type UserPreferencesPayload = {
  investmentStyle: string;
  favoriteCompanies: string;
};

export async function saveUserPreferences(
  payload: UserPreferencesPayload,
): Promise<void> {
  const url = `${API_BASE_URL}/api/v1/users/preferences`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Preferences save failed: HTTP ${res.status}`);
  }
}
