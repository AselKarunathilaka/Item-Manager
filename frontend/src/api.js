const API_URL = '/api/items';

async function request(url, options) {
  const response = await fetch(url, options);

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.fieldErrors = data.errors || {};
    throw error;
  }

  return data;
}

export const itemApi = {
  list: () => request(API_URL),
  get: (id) => request(`${API_URL}/${id}`),
  create: (item) =>
    request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }),
  update: (id, item) =>
    request(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }),
  remove: (id) => request(`${API_URL}/${id}`, { method: 'DELETE' })
};
