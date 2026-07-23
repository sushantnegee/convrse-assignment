const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    return { data: null, error: { message: "Could not reach the server. Check your connection." } };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // no JSON body (e.g. empty response)
  }

  if (!response.ok) {
    const message = body?.error?.message || body?.error || "Something went wrong.";
    return { data: null, error: { message, status: response.status, fields: body?.error?.fields } };
  }

  return { data: body?.data ?? body, error: null };
}

export const api = {
  getProject: (projectId) => request(`/api/projects/${projectId}`),
  getGallery: (projectId) => request(`/api/projects/${projectId}/gallery`),
  getVideos: (projectId) => request(`/api/projects/${projectId}/videos`),
  getTowers: (projectId) => request(`/api/projects/${projectId}/towers`),
  getUnits: (towerId) => request(`/api/towers/${towerId}/units`),
  bookUnit: (unitId, payload) =>
    request(`/api/units/${unitId}/book`, { method: "POST", body: JSON.stringify(payload) }),
};

export { API_BASE_URL };
