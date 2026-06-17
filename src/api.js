const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function loadRemoteData() {
  const response = await fetch(`${API_BASE}/api/data`);
  if (!response.ok) throw new Error('데이터를 불러오지 못했습니다.');
  return response.json();
}

export async function saveRemoteData(data, adminPin) {
  const response = await fetch(`${API_BASE}/api/data`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': adminPin,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || '데이터를 저장하지 못했습니다.');
  }

  return response.json();
}
