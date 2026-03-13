// useDeviceTracking — passive device + location tracking composable.
//
// How it works:
//   1. On first call, generates a UUID and stores it in localStorage as the device ID.
//      This persists across sessions so returning visitors are recognized.
//   2. Immediately POSTs device info (browser, OS, screen, timezone, etc.) to
//      /api/track/session and gets back a sessionId.
//   3. Requests geolocation permission and, if granted, records the position.
//   4. Sets up a repeating interval (default 60s, set via LOCATION_UPDATE_INTERVAL)
//      to update location while the tab is open.
//   5. After the first application draft is saved, call linkToApplication(appId)
//      to associate this device with the applicant.

const DEVICE_ID_KEY = 'gp_device_id'

// Module-level state — shared across all composable calls in one page session
let _initialized = false
let _deviceId = ''
let _sessionId = ''
let _locationTimer: ReturnType<typeof setInterval> | null = null

function parseUserAgent(ua: string) {
  // Browser
  let browser = 'Unknown'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'

  // Version
  const vMatch = ua.match(/(Chrome|Firefox|Safari|Edg|OPR)\/(\d+)/)
  if (vMatch) browser += ' ' + vMatch[2]

  // OS
  let os = 'Unknown'
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) {
    const v = ua.match(/Android ([\d.]+)/); os = 'Android' + (v ? ' ' + v[1] : '')
  } else if (/iPhone|iPad/.test(ua)) {
    const v = ua.match(/OS ([\d_]+)/); os = 'iOS' + (v ? ' ' + v[1].replace(/_/g, '.') : '')
  } else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { browser, os }
}

export function useDeviceTracking() {
  const config = useRuntimeConfig()
  const intervalSecs: number = (config.public.locationUpdateInterval as number) || 60

  // ── Initialise session (runs once per page load) ────────────────────────────
  const init = async () => {
    if (!import.meta.client || _initialized) return
    _initialized = true

    // 1. Get or create persistent device ID
    _deviceId = localStorage.getItem(DEVICE_ID_KEY) || crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, _deviceId)

    // 2. Collect device info
    const ua = navigator.userAgent
    const { browser, os } = parseUserAgent(ua)
    const screen = `${window.screen.width}x${window.screen.height}`
    const language = navigator.language || ''
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

    // 3. Register / update session on server
    try {
      const res = await $fetch<{ sessionId: string }>('/api/track/session', {
        method: 'POST',
        body: { deviceId: _deviceId, browser, os, screen, language, timezone },
      })
      _sessionId = res.sessionId
    } catch (e) {
      console.warn('[tracking] session registration failed', e)
      return
    }

    // 4. Start location tracking
    startLocationTracking()
  }

  // ── Location tracking ───────────────────────────────────────────────────────
  const sendLocation = (pos: GeolocationPosition) => {
    if (!_sessionId) return
    $fetch('/api/track/location', {
      method: 'POST',
      body: {
        deviceId: _deviceId,
        sessionId: _sessionId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      },
    }).catch(() => {}) // silent fail — tracking should never break the app
  }

  const startLocationTracking = () => {
    if (!('geolocation' in navigator)) return

    // Immediate first reading
    navigator.geolocation.getCurrentPosition(sendLocation, () => {}, {
      enableHighAccuracy: false,
      timeout: 10000,
    })

    // Then repeat on interval
    if (_locationTimer) clearInterval(_locationTimer)
    _locationTimer = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendLocation, () => {}, {
        enableHighAccuracy: false,
        timeout: 10000,
      })
    }, intervalSecs * 1000)
  }

  // ── Link to application after first save ────────────────────────────────────
  const linkToApplication = async (applicationId: string) => {
    if (!_deviceId || !applicationId) return
    try {
      await $fetch('/api/track/link', {
        method: 'POST',
        body: { deviceId: _deviceId, applicationId },
      })
    } catch { /* silent */ }
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  const stop = () => {
    if (_locationTimer) { clearInterval(_locationTimer); _locationTimer = null }
    _initialized = false
  }

  return { init, linkToApplication, stop, deviceId: computed(() => _deviceId) }
}
