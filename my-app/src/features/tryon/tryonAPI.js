const baseURL = () => import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const res = await fetch(`${baseURL()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  if (res.status === 204) return null
  return res.json()
}

export const getLooks     = ()          => request('/looks')
export const getLookById  = (id)        => request(`/looks/${id}`)
export const createLook   = (look)      => request('/looks', { method: 'POST', body: JSON.stringify(look) })
export const apiUpdateLook = (id, look) => request(`/looks/${id}`, { method: 'PUT', body: JSON.stringify(look) })
export const apiDeleteLook = (id)       => request(`/looks/${id}`, { method: 'DELETE' }).then(() => id)
