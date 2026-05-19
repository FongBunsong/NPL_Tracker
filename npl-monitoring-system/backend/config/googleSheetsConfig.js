const { google } = require('googleapis')

let sheetsClient = null

/**
 * Returns an authenticated Google Sheets client.
 * Uses API Key for public sheets or Service Account for private sheets.
 */
function getSheetsClient() {
  if (sheetsClient) return sheetsClient

  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  const email  = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key    = process.env.GOOGLE_PRIVATE_KEY

  if (email && key) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: key.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
    sheetsClient = google.sheets({ version: 'v4', auth })
  } else if (apiKey) {
    sheetsClient = google.sheets({ version: 'v4', auth: apiKey })
  } else {
    throw new Error('No Google Sheets credentials configured. Set GOOGLE_SHEETS_API_KEY or service account env vars.')
  }

  return sheetsClient
}

module.exports = { getSheetsClient }
