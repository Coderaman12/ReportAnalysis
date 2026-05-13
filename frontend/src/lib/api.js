const API_BASE = import.meta.env.VITE_API_URL || '';

async function postFormData(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export function analyzeReport(file, notes) {
  const formData = new FormData();
  formData.append('report', file);
  if (notes) formData.append('notes', notes);
  return postFormData('/api/analyze', formData);
}

export function analyzeXray(file) {
  const formData = new FormData();
  formData.append('xray', file);
  return postFormData('/api/xray/analyze', formData);
}
