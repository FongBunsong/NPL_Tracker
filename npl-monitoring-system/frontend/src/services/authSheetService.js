/**
 * authSheetService.js
 *
 * Calls a deployed Google Apps Script Web App to register / login users.
 * Accounts are stored in a Google Sheet "Users" tab and shared across devices.
 *
 * Falls back gracefully if the script URL is not configured.
 */

const SCRIPT_URL_KEY = 'npl_auth_script_url'

export function getScriptUrl() {
  return (
    import.meta.env.VITE_AUTH_SCRIPT_URL ||
    localStorage.getItem(SCRIPT_URL_KEY) ||
    ''
  )
}

export function saveScriptUrl(url) {
  localStorage.setItem(SCRIPT_URL_KEY, url.trim())
}

/**
 * Send a request to the Apps Script Web App.
 * Uses URLSearchParams (application/x-www-form-urlencoded) to avoid CORS preflight.
 */
async function callScript(scriptUrl, payload) {
  const params = new URLSearchParams()
  params.append('payload', JSON.stringify(payload))

  const res = await fetch(scriptUrl, {
    method: 'POST',
    body: params,
    // No explicit Content-Type header → browser sets application/x-www-form-urlencoded
    // which is a "simple" CORS request and skips preflight OPTIONS
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Invalid response from auth server')
  }
}

/**
 * Register a new user.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export async function sheetRegister(name, email, password) {
  const url = getScriptUrl()
  if (!url) throw new Error('NO_SCRIPT_URL')
  return callScript(url, { action: 'register', name, email, password })
}

/**
 * Log in an existing user.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export async function sheetLogin(email, password) {
  const url = getScriptUrl()
  if (!url) throw new Error('NO_SCRIPT_URL')
  return callScript(url, { action: 'login', email, password })
}

/**
 * Ping the Apps Script endpoint to verify it's reachable.
 * @returns {{ success: boolean }}
 */
export async function testScriptConnection(url) {
  try {
    const res = await fetch(`${url}?action=ping`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
