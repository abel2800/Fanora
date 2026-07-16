const STORAGE_KEY = 'fanora_data_saver'

export function getDataSaverEnabled() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached !== null) return cached === 'true'
  } catch {
    /* ignore */
  }
  return false
}

export function setDataSaverEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}

/** Sync from user settings preferences when available */
export function syncDataSaverFromSettings(settings) {
  const enabled = Boolean(settings?.preferences?.dataSaver)
  setDataSaverEnabled(enabled)
  return enabled
}

export function mediaPropsForDataSaver({ autoPlay = false } = {}) {
  const saver = getDataSaverEnabled()
  return {
    dataSaver: saver,
    loading: saver ? 'lazy' : undefined,
    autoPlay: saver ? false : autoPlay,
    preload: saver ? 'none' : 'metadata',
  }
}
