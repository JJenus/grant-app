// useDeviceTracking
//
// Flow:
//   1. Generate/restore persistent device ID from localStorage.
//   2. Register session (browser, OS, screen, timezone) with the server.
//   3. Request geolocation.
//      - Granted  → record position, start interval, set locationGranted = true
//      - Denied   → set locationBlocked = true (app.vue shows blocking modal)
//   4. While blocked: retry every 8 seconds so if the user resets permission
//      in browser settings and reloads, or grants via the modal retry button,
//      it picks up immediately.
//   5. After first draft save, linkToApplication(appId) links device → applicant.

const DEVICE_ID_KEY = 'gp_device_id'

// Module-level reactive state — one instance shared across all composable calls
const locationGranted = ref(false)
const locationBlocked = ref(false)

let _initialized = false
let _deviceId = ''
let _sessionId = ''
let _locationTimer: ReturnType<typeof setInterval> | null = null
let _retryTimer: ReturnType<typeof setInterval> | null = null

function parseUserAgent(ua: string) {
  let browser = 'Unknown'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  const vMatch = ua.match(/(Chrome|Firefox|Safari|Edg|OPR)\/(\d+)/)
  if (vMatch) browser += ' ' + vMatch[2]

  let os = 'Unknown'
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) { const v = ua.match(/Android ([\d.]+)/); os = 'Android' + (v ? ' ' + v[1] : '') }
  else if (/iPhone|iPad/.test(ua)) { const v = ua.match(/OS ([\d_]+)/); os = 'iOS' + (v ? ' ' + v[1].replace(/_/g, '.') : '') }
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'
  return { browser, os }
}

export function useDeviceTracking() {
  const config = useRuntimeConfig()
  const intervalSecs: number = (config.public.locationUpdateInterval as number) || 60

  const sendLocation = (pos: GeolocationPosition) => {
    if (!_sessionId) return
    // Location granted — clear blocked state, stop retry loop
    locationGranted.value = true
    locationBlocked.value = false
    if (_retryTimer) { clearInterval(_retryTimer); _retryTimer = null }

    $fetch('/api/track/location', {
      method: 'POST',
      body: {
        deviceId: _deviceId,
        sessionId: _sessionId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      },
    }).catch(() => {})
  }

  const onDenied = () => {
    locationBlocked.value = true
    locationGranted.value = false
  }

  // Try to get location once. Starts the retry loop if denied.
  const requestLocation = () => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(sendLocation, onDenied, {
      enableHighAccuracy: false,
      timeout: 12000,
    })
  }

  // Called from the modal "Try Again" button or automatically on retry loop
  const retryLocation = () => {
    requestLocation()
  }

  const startLocationInterval = () => {
    if (_locationTimer) clearInterval(_locationTimer)
    _locationTimer = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendLocation, onDenied, {
        enableHighAccuracy: false,
        timeout: 12000,
      })
    }, intervalSecs * 1000)
  }

  const init = async () => {
    if (!import.meta.client || _initialized) return
    _initialized = true

    // 1. Persistent device ID
    _deviceId = localStorage.getItem(DEVICE_ID_KEY) || crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, _deviceId)

    // 2. Device info → server session
    const ua = navigator.userAgent
    const { browser, os } = parseUserAgent(ua)
    const screenSize = `${window.screen.width}x${window.screen.height}`
    const language = navigator.language || ''
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

    try {
      const res = await $fetch<{ sessionId: string }>('/api/track/session', {
        method: 'POST',
        body: { deviceId: _deviceId, browser, os, screen: screenSize, language, timezone },
      })
      _sessionId = res.sessionId
    } catch (e) {
      console.warn('[tracking] session registration failed', e)
      return
    }

    // 3. First location request
    requestLocation()

    // 4. Start retry loop — fires every 8s while blocked so it picks up
    //    immediately after the user grants permission in browser settings
    _retryTimer = setInterval(() => {
      if (!locationBlocked.value) { clearInterval(_retryTimer!); _retryTimer = null; return }
      requestLocation()
    }, 8000)

    // 5. Start the regular update interval (only sends when granted)
    startLocationInterval()
  }

  const linkToApplication = async (applicationId: string) => {
    if (!_deviceId || !applicationId) return
    $fetch('/api/track/link', {
      method: 'POST',
      body: { deviceId: _deviceId, applicationId },
    }).catch(() => {})
  }

  const stop = () => {
    if (_locationTimer) { clearInterval(_locationTimer); _locationTimer = null }
    if (_retryTimer) { clearInterval(_retryTimer); _retryTimer = null }
    _initialized = false
  }

  return {
    init,
    linkToApplication,
    retryLocation,
    stop,
    locationGranted,
    locationBlocked,
    deviceId: computed(() => _deviceId),
  }
}
