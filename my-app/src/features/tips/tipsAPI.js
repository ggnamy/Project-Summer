const BASE = () => `${import.meta.env.VITE_API_URL}/tips`

const json = (r) => { if (!r.ok) throw new Error(r.statusText); return r.json() }

export const fetchTips    = ()           => fetch(BASE()).then(json)
export const fetchTipById = (id)         => fetch(`${BASE()}/${id}`).then(json)
export const createTip    = (data)       => fetch(BASE(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(json)
export const updateTip    = (id, data)   => fetch(`${BASE()}/${id}`, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(json)
export const deleteTip    = (id)         => fetch(`${BASE()}/${id}`, { method: 'DELETE' }).then(json)
