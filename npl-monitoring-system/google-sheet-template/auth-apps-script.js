/**
 * NPL Monitor — User Authentication Script
 * ==========================================
 * Deploy this as a Google Apps Script Web App to enable shared sign-up/sign-in
 * across all devices using a Google Sheet as the user database.
 *
 * SETUP STEPS:
 * 1. Open script.google.com → New project
 * 2. Paste this entire file (replacing the default code)
 * 3. Replace YOUR_SPREADSHEET_ID below with your Google Sheet's ID
 * 4. In that Sheet, create a tab named "Users"
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL → paste into NPL Monitor Settings → User Authentication
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'  // ← Replace this
const SHEET_NAME     = 'Users'

// Column positions (0-indexed): ID | Name | Email | Password | CreatedAt
const COL = { ID: 0, NAME: 1, EMAIL: 2, PASSWORD: 3, CREATED_AT: 4 }

function getSheet() {
  return SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAME)
}

function initials(name) {
  return (name || '').trim().split(/\s+/).map(w => (w[0] || '').toUpperCase()).join('').slice(0, 2) || '?'
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ─── Handle GET (ping / health check) ────────────────────────────────────────
function doGet(e) {
  return jsonResponse({ status: 'NPL Auth API running', timestamp: new Date().toISOString() })
}

// ─── Handle POST (register / login) ──────────────────────────────────────────
function doPost(e) {
  try {
    // Payload is sent as URL-encoded form data: payload=<JSON string>
    const payload = e.parameter && e.parameter.payload
      ? JSON.parse(e.parameter.payload)
      : JSON.parse(e.postData.contents)

    const action = payload.action

    if (action === 'register') {
      return handleRegister(payload)
    }
    if (action === 'login') {
      return handleLogin(payload)
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action })
  } catch (err) {
    return jsonResponse({ success: false, error: 'Server error: ' + err.message })
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────
function handleRegister(data) {
  const { name, email, password } = data
  if (!name || !email || !password) {
    return jsonResponse({ success: false, error: 'name, email, and password are required' })
  }

  const sheet  = getSheet()
  const values = sheet.getDataRange().getValues()

  // Check for duplicate email (skip header row if present)
  const duplicate = values.some((row, i) => {
    if (i === 0 && String(row[COL.EMAIL]).toLowerCase() === 'email') return false // skip header
    return String(row[COL.EMAIL]).toLowerCase() === email.toLowerCase()
  })

  if (duplicate) {
    return jsonResponse({ success: false, error: 'An account with this email already exists' })
  }

  const id        = Date.now().toString()
  const createdAt = new Date().toISOString()
  sheet.appendRow([id, name, email, password, createdAt])

  return jsonResponse({
    success: true,
    user: { id, name, email, avatar: initials(name), createdAt },
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────
function handleLogin(data) {
  const { email, password } = data
  if (!email || !password) {
    return jsonResponse({ success: false, error: 'email and password are required' })
  }

  const sheet  = getSheet()
  const values = sheet.getDataRange().getValues()

  const row = values.find((r, i) => {
    if (i === 0 && String(r[COL.EMAIL]).toLowerCase() === 'email') return false // skip header
    return (
      String(r[COL.EMAIL]).toLowerCase() === email.toLowerCase() &&
      String(r[COL.PASSWORD]) === password
    )
  })

  if (!row) {
    return jsonResponse({ success: false, error: 'Invalid email or password' })
  }

  return jsonResponse({
    success: true,
    user: {
      id:        String(row[COL.ID]),
      name:      String(row[COL.NAME]),
      email:     String(row[COL.EMAIL]),
      avatar:    initials(String(row[COL.NAME])),
      createdAt: String(row[COL.CREATED_AT]),
    },
  })
}
