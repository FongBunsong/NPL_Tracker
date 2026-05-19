import { useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export function useGoogleSheets() {
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const syncFromSheets = useCallback(async (sheetId, apiKey, range = 'Loans!A1:Z') => {
    if (!sheetId || !apiKey) {
      toast.error('Google Sheet ID and API Key are required')
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}?key=${apiKey}`
      const { data } = await axios.get(url)
      const rows = data.values ?? []
      setLastSync(new Date())
      toast.success(`Synced ${Math.max(rows.length - 1, 0)} records from Google Sheets`)
      return rows
    } catch (err) {
      const msg = err.response?.data?.error?.message ?? 'Failed to sync from Google Sheets'
      setError(msg)
      toast.error(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const testConnection = useCallback(async (sheetId, apiKey) => {
    if (!sheetId || !apiKey) {
      toast.error('Provide both Sheet ID and API Key to test')
      return false
    }
    setLoading(true)
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}?key=${apiKey}`
      await axios.get(url)
      toast.success('Google Sheets connection successful!')
      return true
    } catch {
      toast.error('Connection failed. Verify your Sheet ID and API Key.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { syncFromSheets, testConnection, loading, error, lastSync }
}
