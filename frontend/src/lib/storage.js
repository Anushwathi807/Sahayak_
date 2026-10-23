// Browser storage can be blocked or full; every access degrades to "nothing stored".
export function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export function removeKey(storage, key) {
  try {
    storage.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}
