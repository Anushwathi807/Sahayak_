export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function detailText(payload) {
  const detail = payload?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  return null
}

async function toError(res) {
  const payload = await res.json().catch(() => null)
  const detail = detailText(payload)
  if (res.status === 503) {
    return new ApiError("Sahayak's AI service is busy right now. Wait a few seconds and try again.", 503)
  }
  if (res.status === 401 || res.status === 403) {
    return new ApiError('Your sign-in has expired. Sign out and sign in again.', res.status)
  }
  if (res.status === 413) {
    return new ApiError('That file is too large. Use a file under 10 MB.', 413)
  }
  return new ApiError(detail || `The server could not complete this (error ${res.status}).`, res.status)
}

const UNREACHABLE = 'The Sahayak server is not reachable. Check that the backend is running, then try again.'

export function createApi(getToken) {
  async function send(path, init = {}) {
    const token = await getToken()
    let res
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
      })
    } catch {
      throw new ApiError(UNREACHABLE, 0)
    }
    if (!res.ok) throw await toError(res)
    return res
  }

  return {
    async get(path) {
      return (await send(path)).json()
    },
    async post(path, body) {
      const res = await send(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json()
    },
    async upload(path, formData) {
      return (await send(path, { method: 'POST', body: formData })).json()
    },
    async download(path, body) {
      const res = await send(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.blob()
    },
  }
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
