import { useState } from 'react'
import { Database, Bot, Shield, Bell, Save, TestTube2, ExternalLink, CheckCircle, AlertTriangle, Users } from 'lucide-react'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { sendTelegramAlert, formatTelegramMessage } from '../services/alertService'
import { saveScriptUrl, getScriptUrl, testScriptConnection } from '../services/authSheetService'
import { NPL_RATIO_ALERT_THRESHOLD } from '../utils/constants'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-blue-600" />
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  )
}

export default function Settings() {
  // Auth script state
  const [scriptUrl,    setScriptUrl]    = useState(getScriptUrl)
  const [testingScript, setTestingScript] = useState(false)

  const handleSaveScriptUrl = () => {
    saveScriptUrl(scriptUrl)
    toast.success('Auth script URL saved')
  }

  const handleTestScript = async () => {
    if (!scriptUrl.trim()) { toast.error('Paste the Apps Script URL first'); return }
    setTestingScript(true)
    const ok = await testScriptConnection(scriptUrl.trim())
    setTestingScript(false)
    ok ? toast.success('Connection successful! Auth is ready.') : toast.error('Could not reach the script. Check the URL and deployment settings.')
  }

  // Google Sheets state
  const [sheetId,  setSheetId]  = useState(import.meta.env.VITE_GOOGLE_SHEET_ID  ?? '')
  const [apiKey,   setApiKey]   = useState(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ?? '')
  const { testConnection, loading: sheetsLoading } = useGoogleSheets()

  // Telegram state
  const [botToken, setBotToken] = useState('')
  const [chatId,   setChatId]   = useState('')
  const [testingTg, setTestingTg] = useState(false)

  // Alert thresholds state
  const [nplThreshold, setNplThreshold] = useState(NPL_RATIO_ALERT_THRESHOLD)
  const [dpd30Alert,   setDpd30Alert]   = useState(true)
  const [dpd60Alert,   setDpd60Alert]   = useState(true)
  const [dpd90Alert,   setDpd90Alert]   = useState(true)

  const handleTestTelegram = async () => {
    if (!botToken || !chatId) { toast.error('Enter Bot Token and Chat ID first'); return }
    setTestingTg(true)
    try {
      const testMsg = formatTelegramMessage({
        priority: 'medium',
        type: 'DPD_30',
        message: 'This is a test notification from NPL Monitor. Your Telegram integration is working correctly!',
        createdAt: new Date().toISOString(),
      })
      await sendTelegramAlert(testMsg, botToken, chatId)
      toast.success('Test message sent to Telegram!')
    } catch {
      toast.error('Failed to send. Check your Bot Token and Chat ID.')
    }
    setTestingTg(false)
  }

  const handleSaveThresholds = () => {
    toast.success('Alert thresholds saved')
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── User Authentication ── */}
      <Section icon={Users} title="User Authentication (Google Sheets)">
        <div className="space-y-4">
          <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl text-sm">
            <p className="font-semibold text-violet-800 mb-2">Why connect?</p>
            <p className="text-violet-700 text-xs leading-relaxed">
              By default, accounts are stored only in this browser. Connect a Google Apps Script so accounts are shared across all devices — anyone can sign up once and log in from anywhere.
            </p>
          </div>

          <Input
            label="Apps Script Web App URL"
            value={scriptUrl}
            onChange={e => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            helper="Deploy the auth script (see instructions below) and paste the URL here"
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ExternalLink size={13} /> Setup Instructions
            </p>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Open <strong>script.google.com</strong> → New project</li>
              <li>Delete any existing code, then paste the script from <code className="bg-slate-200 px-1 rounded">google-sheet-template/auth-apps-script.js</code> in the repo</li>
              <li>Replace <code className="bg-slate-200 px-1 rounded">YOUR_SPREADSHEET_ID</code> with the ID of a Google Sheet you own</li>
              <li>In that Sheet, create a tab named <strong>Users</strong></li>
              <li>Click <strong>Deploy → New deployment → Web app</strong></li>
              <li>Set <em>Execute as</em>: <strong>Me</strong> · <em>Who has access</em>: <strong>Anyone</strong></li>
              <li>Copy the deployment URL and paste it above</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="sm" icon={TestTube2} loading={testingScript} onClick={handleTestScript}>
              Test Connection
            </Button>
            <Button size="sm" icon={Save} onClick={handleSaveScriptUrl}>
              Save URL
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Google Sheets ── */}
      <Section icon={Database} title="Google Sheets Integration">
        <div className="space-y-4">
          <Input
            label="Google Sheet ID"
            value={sheetId}
            onChange={e => setSheetId(e.target.value)}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            helper="Found in the spreadsheet URL between /d/ and /edit"
          />
          <Input
            label="Google Sheets API Key"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIzaSy…"
            helper="From Google Cloud Console → APIs & Services → Credentials"
          />

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <p className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <ExternalLink size={14} /> Setup Instructions
            </p>
            <ol className="text-blue-700 space-y-1 text-xs list-decimal list-inside">
              <li>Create a Google Sheet using the template column headers below</li>
              <li>Enable Google Sheets API in Google Cloud Console</li>
              <li>Create an API Key and restrict it to Sheets API</li>
              <li>Share your sheet as "Anyone with link can view"</li>
              <li>Paste the Sheet ID and API Key above and click Test</li>
            </ol>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Required Sheet Columns (Row 1 Headers)</p>
            <div className="flex flex-wrap gap-1.5">
              {['Loan ID', 'Customer ID', 'Customer Name', 'Loan Amount', 'Outstanding Balance', 'Days Past Due', 'Disbursement Date', 'Maturity Date', 'Interest Rate', 'Loan Type', 'Collateral Type', 'Collateral Value', 'Branch', 'Loan Officer', 'Last Payment Date', 'Phone', 'Email'].map(col => (
                <span key={col} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-gray-600">{col}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary" size="sm" icon={TestTube2}
              loading={sheetsLoading}
              onClick={() => testConnection(sheetId, apiKey)}
            >
              Test Connection
            </Button>
            <Button
              size="sm" icon={Save}
              onClick={() => toast.success('Google Sheets settings saved')}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Telegram Bot ── */}
      <Section icon={Bot} title="Telegram Bot Notifications">
        <div className="space-y-4">
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm">
            <p className="font-medium text-sky-800 mb-2 flex items-center gap-2">
              <Bot size={14} /> How to set up Telegram alerts
            </p>
            <ol className="text-sky-700 space-y-1 text-xs list-decimal list-inside">
              <li>Open Telegram and search for <strong>@BotFather</strong></li>
              <li>Send <code className="bg-sky-100 px-1 rounded">/newbot</code> and follow the steps to get your Bot Token</li>
              <li>Start a chat with your bot or add it to a group</li>
              <li>Get your Chat ID from <strong>@userinfobot</strong></li>
              <li>Paste both below and click Send Test Message</li>
            </ol>
          </div>

          <Input
            label="Telegram Bot Token"
            type="password"
            value={botToken}
            onChange={e => setBotToken(e.target.value)}
            placeholder="1234567890:ABCDefGHIjklMNOpqrSTUvwxYZ"
            helper="From @BotFather after creating your bot"
          />
          <Input
            label="Telegram Chat ID"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="-1001234567890 or 123456789"
            helper="Your personal or group Chat ID"
          />

          <div className="flex gap-3">
            <Button
              variant="secondary" size="sm" icon={TestTube2}
              loading={testingTg}
              onClick={handleTestTelegram}
            >
              Send Test Message
            </Button>
            <Button size="sm" icon={Save} onClick={() => toast.success('Telegram settings saved')}>
              Save Settings
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Alert Thresholds ── */}
      <Section icon={Bell} title="Alert Thresholds">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              NPL Ratio Alert Threshold (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={20} value={nplThreshold}
                onChange={e => setNplThreshold(Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <span className="w-16 text-center font-bold text-lg text-gray-900">{nplThreshold}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Alert triggers when portfolio NPL ratio exceeds this value</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">DPD Alert Triggers</p>
            {[
              { label: '30 DPD Alert (Special Mention)', key: 'dpd30', value: dpd30Alert, onChange: setDpd30Alert, color: 'bg-amber-500' },
              { label: '60 DPD Alert (Substandard / NPL Entry)', key: 'dpd60', value: dpd60Alert, onChange: setDpd60Alert, color: 'bg-orange-500' },
              { label: '90 DPD Alert (Doubtful / Provision Required)', key: 'dpd90', value: dpd90Alert, onChange: setDpd90Alert, color: 'bg-red-600' },
            ].map(({ label, value, onChange, color }) => (
              <label key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-3 h-3 rounded-full', color)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <div
                  onClick={() => onChange(v => !v)}
                  className={clsx('w-11 h-6 rounded-full transition-colors relative cursor-pointer', value ? 'bg-blue-600' : 'bg-gray-300')}
                >
                  <div className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
              </label>
            ))}
          </div>

          <Button icon={Save} onClick={handleSaveThresholds}>
            Save Threshold Settings
          </Button>
        </div>
      </Section>

      {/* ── Security Info ── */}
      <Section icon={Shield} title="Security">
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={15} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800">Security Recommendations</p>
            </div>
            <ul className="text-xs text-green-700 space-y-1 list-disc list-inside mt-2">
              <li>Store API keys in environment variables (.env), never commit them to source control</li>
              <li>Restrict Google Sheets API Key to allowed HTTP referrers</li>
              <li>Rotate your Telegram Bot Token periodically</li>
              <li>Use a dedicated read-only Google service account for production</li>
              <li>Enable HTTPS in production deployment</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={15} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Current Demo Mode</p>
            </div>
            <p className="text-xs text-amber-700">
              The system is running with mock data. Connect Google Sheets above to load real loan data.
            </p>
          </div>
        </div>
      </Section>

    </div>
  )
}
