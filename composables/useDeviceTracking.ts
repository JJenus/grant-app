// useDeviceTracking
//
// Modal race fix:
//   Before calling getCurrentPosition, check the Permissions API first.
//   If permission is already 'granted', skip the prompt entirely and go straight
//   to recording. If 'denied', go straight to blocked state — no prompt needed.
//   Only if 'prompt' do we actually call getCurrentPosition (which triggers the
//   browser's native dialog).
//
//   This eliminates the false-positive where a granted permission briefly fires
//   the error callback due to a timing race between the retry interval and the
//   success callback.

const DEVICE_ID_KEY = 'gp_device_id'

// Module-level reactive state — one instance shared across all composable calls
const locationGranted = ref(false)
const locationBlocked = ref(false)

let _initialized = false
let _deviceId = ''
let _sessionId = ''
let _locationTimer: ReturnType<typeof setInterval> | null = null
let _retryTimer: ReturnType<typeof setInterval> | null = null
let _permissionState: PermissionState | null = null  // 'granted' | 'denied' | 'prompt'

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
    _permissionState = 'granted'
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
    // Ignore if we already know permission is granted — this can fire spuriously
    // during a race between the retry interval and a slow GPS fix
    if (_permissionState === 'granted' || locationGranted.value) return
    _permissionState = 'denied'
    locationBlocked.value = true
    locationGranted.value = false
  }

  // Check the Permissions API first, then act accordingly — no unnecessary prompts
  const requestLocation = async () => {
    if (!('geolocation' in navigator)) return

    // Use Permissions API when available (Chrome, Edge, Firefox — not Safari iOS)
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' })
        _permissionState = status.state

        // Watch for permission changes in browser settings without reload
        status.onchange = () => {
          _permissionState = status.state
          if (status.state === 'granted') {
            locationBlocked.value = false
            locationGranted.value = true
            if (_retryTimer) { clearInterval(_retryTimer); _retryTimer = null }
            navigator.geolocation.getCurrentPosition(sendLocation, onDenied, { timeout: 12000 })
          } else if (status.state === 'denied') {
            onDenied()
          }
        }

        if (status.state === 'denied') {
          onDenied()
          return
        }
        // 'granted' or 'prompt' — proceed to getCurrentPosition
      } catch { /* Permissions API unavailable — fall through */ }
    }

    navigator.geolocation.getCurrentPosition(sendLocation, onDenied, {
      enableHighAccuracy: false,
      timeout: 12000,
    })
  }

  // Exposed for the modal "Allow & Continue" button
  const retryLocation = () => { requestLocation() }

  const startLocationInterval = () => {
    if (_locationTimer) clearInterval(_locationTimer)
    _locationTimer = setInterval(() => {
      // Only ping if permission is granted — don't re-trigger prompt mid-session
      if (_permissionState === 'granted') {
        navigator.geolocation.getCurrentPosition(sendLocation, () => {}, { timeout: 12000 })
      }
    }, intervalSecs * 1000)
  }

  const init = async () => {
    if (!import.meta.client || _initialized) return
    _initialized = true

    // 1. Persistent device ID
    _deviceId = localStorage.getItem(DEVICE_ID_KEY) || crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, _deviceId)

    // 2. Register session with server
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

    // 3. First location request — checks Permissions API before prompting
    await requestLocation()

    // 4. Retry loop — only active while blocked, clears itself when granted.
    //    Runs every 8s so permission changes in browser settings are detected quickly.
    _retryTimer = setInterval(() => {
      if (!locationBlocked.value) { clearInterval(_retryTimer!); _retryTimer = null; return }
      requestLocation()
    }, 8000)

    // 5. Interval for ongoing location updates
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
