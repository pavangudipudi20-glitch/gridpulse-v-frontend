import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const API = 'http://localhost:5000'
const SETTINGS_STORAGE_KEY = 'gridpulse_settings'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('gridpulse_logged_in') === 'true'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gridpulse_user') || 'null')
    } catch {
      return null
    }
  })

  const [selectedTransformer, setSelectedTransformer] = useState(null)
  const [transformers, setTransformers] = useState([])
  const [liveTransformers, setLiveTransformers] = useState([])
  const [sensorReadings, setSensorReadings] = useState([])
  const [eventRecords, setEventRecords] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [maintenanceReports, setMaintenanceReports] = useState([])
  const [devices, setDevices] = useState([])
  const [alerts, setAlerts] = useState([])

  const [detailTab, setDetailTab] = useState('Overview')
  const [historyRange, setHistoryRange] = useState('24H')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [reportType, setReportType] = useState('Health')
  const [showAddTransformer, setShowAddTransformer] = useState(false)
  const [showEditTransformer, setShowEditTransformer] = useState(false)
  const [editTransformer, setEditTransformer] = useState(null)

  const [newTransformerId, setNewTransformerId] = useState('')
  const [newTransformerLocation, setNewTransformerLocation] = useState('')
  const [newTransformerCapacity, setNewTransformerCapacity] = useState('')
  const [newTransformerStatus, setNewTransformerStatus] = useState('Healthy')
  const [newTransformerLatitude, setNewTransformerLatitude] = useState('')
  const [newTransformerLongitude, setNewTransformerLongitude] = useState('')

  const [temperatureMonitoring, setTemperatureMonitoring] = useState(true)
  const [vibrationMonitoring, setVibrationMonitoring] = useState(true)
  const [alertNotifications, setAlertNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [temperatureThreshold, setTemperatureThreshold] = useState(70)
  const [temperatureCriticalThreshold, setTemperatureCriticalThreshold] = useState(85)
  const [vibrationThreshold, setVibrationThreshold] = useState(3)
  const [vibrationCriticalThreshold, setVibrationCriticalThreshold] = useState(4.9)
  const [voltageThreshold, setVoltageThreshold] = useState(11.0)
  const [voltageCriticalThreshold, setVoltageCriticalThreshold] = useState(11.5)
  const [currentThreshold, setCurrentThreshold] = useState(25)
  const [currentCriticalThreshold, setCurrentCriticalThreshold] = useState(30)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}')
      if (saved.temperatureMonitoring !== undefined) setTemperatureMonitoring(saved.temperatureMonitoring)
      if (saved.vibrationMonitoring !== undefined) setVibrationMonitoring(saved.vibrationMonitoring)
      if (saved.alertNotifications !== undefined) setAlertNotifications(saved.alertNotifications)
      if (saved.autoRefresh !== undefined) setAutoRefresh(saved.autoRefresh)
      if (saved.temperatureThreshold !== undefined) setTemperatureThreshold(saved.temperatureThreshold)
      if (saved.temperatureCriticalThreshold !== undefined) setTemperatureCriticalThreshold(saved.temperatureCriticalThreshold)
      if (saved.vibrationThreshold !== undefined) setVibrationThreshold(saved.vibrationThreshold)
      if (saved.vibrationCriticalThreshold !== undefined) setVibrationCriticalThreshold(saved.vibrationCriticalThreshold)
      if (saved.voltageThreshold !== undefined) setVoltageThreshold(saved.voltageThreshold)
      if (saved.voltageCriticalThreshold !== undefined) setVoltageCriticalThreshold(saved.voltageCriticalThreshold)
      if (saved.currentThreshold !== undefined) setCurrentThreshold(saved.currentThreshold)
      if (saved.currentCriticalThreshold !== undefined) setCurrentCriticalThreshold(saved.currentCriticalThreshold)
    } catch (error) {
      console.error('Failed to load GRIDPULSE-V settings:', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      temperatureMonitoring,
      vibrationMonitoring,
      alertNotifications,
      autoRefresh,
      temperatureThreshold,
      temperatureCriticalThreshold,
      vibrationThreshold,
      vibrationCriticalThreshold,
      voltageThreshold,
      voltageCriticalThreshold,
      currentThreshold,
      currentCriticalThreshold
    }))
  }, [
    temperatureMonitoring,
    vibrationMonitoring,
    alertNotifications,
    autoRefresh,
    temperatureThreshold,
    temperatureCriticalThreshold,
    vibrationThreshold,
    vibrationCriticalThreshold,
    voltageThreshold,
    voltageCriticalThreshold,
    currentThreshold,
    currentCriticalThreshold
  ])

  const token = localStorage.getItem('gridpulse_token')

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('gridpulse_token') || ''}`
  })

  const handleAuthExpired = () => {
    localStorage.removeItem('gridpulse_logged_in')
    localStorage.removeItem('gridpulse_token')
    localStorage.removeItem('gridpulse_user')
    setLoggedInUser(null)
    setIsLoggedIn(false)
  }

  const apiFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders(),
        ...(options.headers || {})
      }
    })
    if (response.status === 401) handleAuthExpired()
    return response
  }

  const handleLogin = async (event) => {
    event?.preventDefault()
    try {
      const response = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message || 'Login failed')
        return
      }
      localStorage.setItem('gridpulse_logged_in', 'true')
      localStorage.setItem('gridpulse_token', data.token)
      localStorage.setItem('gridpulse_user', JSON.stringify(data.user || null))
      setLoggedInUser(data.user || null)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login error:', error)
      alert('Unable to connect to the GRIDPULSE-V server')
    }
  }

  const handleLogout = () => handleAuthExpired()

  const loadTransformers = async () => {
    try {
      const response = await apiFetch(`${API}/api/transformers`)
      if (!response.ok) return
      const data = await response.json()
      const list = Array.isArray(data) ? data : data.transformers || []
      setTransformers(list)
      setLiveTransformers(list)
      console.log('Transformers received:', list)
      setSelectedTransformer(current => {
        if (!current) return list[0] || null
        return list.find(item => String(item.id) === String(current.id)) || current
      })
    } catch (error) {
      console.error('Transformers error:', error)
    }
  }

  const loadDevices = async () => {
    try {
      const response = await apiFetch(`${API}/api/devices`)
      if (!response.ok) return
      const data = await response.json()
      const list = Array.isArray(data) ? data : data.devices || []
      setDevices(list)
      console.log('Devices received:', list)
    } catch (error) {
      console.error('Devices error:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await apiFetch(`${API}/api/alerts`)
      if (!response.ok) return
      const data = await response.json()
      const list = Array.isArray(data) ? data : data.alerts || []
      setAlerts(list)
      console.log('Alerts received:', list)
    } catch (error) {
      console.error('Alerts error:', error)
    }
  }

  const loadMaintenance = async () => {
    try {
      const response = await apiFetch(`${API}/api/maintenance`)
      if (!response.ok) return
      const data = await response.json()
      const list = Array.isArray(data) ? data : data.maintenance || data.reports || []
      setMaintenanceReports(list)
      console.log('Maintenance reports received:', list)
    } catch (error) {
      console.error('Maintenance error:', error)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || !token) return
    loadTransformers()
    loadDevices()
    loadAlerts()
    loadMaintenance()
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || !autoRefresh) return
    const interval = setInterval(() => {
      loadTransformers()
      loadDevices()
      loadAlerts()
      loadMaintenance()
    }, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn, autoRefresh, selectedTransformer?.id])

  useEffect(() => {
    if (!selectedTransformer) {
      setSensorReadings([])
      return
    }
    let mounted = true
    const fetchSensorReadings = async () => {
      try {
        const response = await apiFetch(`${API}/api/sensor-data/${selectedTransformer.id}`)
        const data = await response.json()
        if (!response.ok) {
          if (mounted) setSensorReadings([])
          return
        }
        if (mounted) setSensorReadings(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Sensor readings error:', error)
        if (mounted) setSensorReadings([])
      }
    }
    fetchSensorReadings()
    const interval = setInterval(fetchSensorReadings, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [selectedTransformer?.id])

  useEffect(() => {
    if (!selectedTransformer) {
      setEventRecords([])
      setMaintenanceRecords([])
      return
    }
    const loadDetailData = async () => {
      try {
        const alertResponse = await apiFetch(`${API}/api/alerts`)
        if (alertResponse.ok) {
          const data = await alertResponse.json()
          const list = Array.isArray(data) ? data : data.alerts || []
          setEventRecords(list.filter(item => String(item.transformer_id || item.transformerId || item.transformer) === String(selectedTransformer.id)))
        }
      } catch (error) {
        console.error(error)
      }
      try {
        const response = await apiFetch(`${API}/api/maintenance/${selectedTransformer.id}`)
        if (response.ok) {
          const data = await response.json()
          setMaintenanceRecords(Array.isArray(data) ? data : data.maintenance || data.reports || [])
        }
      } catch (error) {
        console.error(error)
      }
    }
    loadDetailData()
  }, [selectedTransformer?.id])

  const getLatestSensorValue = (sensorType) => {
    const values = sensorReadings
      .filter(item => item.sensor_type === sensorType)
      .filter(item => !Number.isNaN(new Date(item.recorded_at).getTime()))
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    return values.length ? Number(values[0].value) : null
  }

  const currentTemperature = getLatestSensorValue('temperature')
  const currentVibration = getLatestSensorValue('vibration')
  const currentVoltage = getLatestSensorValue('voltage')
  const currentCurrent = getLatestSensorValue('current')
  const currentHumidity = getLatestSensorValue('humidity')
  const currentAcoustic = getLatestSensorValue('acoustic')

  const latestSensorReading = {
    temperature_c: currentTemperature,
    vibration_mm_s: currentVibration,
    voltage_kv: currentVoltage,
    current_a: currentCurrent,
    humidity_percent: currentHumidity,
    acoustic_db: currentAcoustic
  }

  const healthScore = useMemo(() => {
    let score = 100
    if (currentTemperature !== null) score -= currentTemperature > temperatureCriticalThreshold ? 30 : currentTemperature > temperatureThreshold ? 15 : 0
    if (currentVibration !== null) score -= currentVibration > vibrationCriticalThreshold ? 30 : currentVibration > vibrationThreshold ? 15 : 0
    if (currentVoltage !== null) score -= currentVoltage > voltageCriticalThreshold ? 30 : currentVoltage > voltageThreshold ? 15 : 0
    if (currentCurrent !== null) score -= currentCurrent > currentCriticalThreshold ? 30 : currentCurrent > currentThreshold ? 15 : 0
    return Math.max(0, Math.round(score))
  }, [currentTemperature, currentVibration, currentVoltage, currentCurrent, temperatureThreshold, temperatureCriticalThreshold, vibrationThreshold, vibrationCriticalThreshold, voltageThreshold, voltageCriticalThreshold, currentThreshold, currentCriticalThreshold])

  const healthRiskLevel = healthScore >= 80 ? 'Low' : healthScore >= 50 ? 'Medium' : 'High'
  const anomalyDetected = (
    (currentTemperature !== null && currentTemperature > temperatureThreshold) ||
    (currentVibration !== null && currentVibration > vibrationThreshold) ||
    (currentVoltage !== null && currentVoltage > voltageThreshold) ||
    (currentCurrent !== null && currentCurrent > currentThreshold)
  )
  const analysisStatus = anomalyDetected ? 'Attention Required' : 'Normal'

  const filteredSensorReadings = useMemo(() => {
    const sorted = [...sensorReadings]
      .filter(item => !Number.isNaN(new Date(item.recorded_at).getTime()))
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    if (!sorted.length) return []
    const latest = new Date(sorted[sorted.length - 1].recorded_at).getTime()
    const hours = { '1H': 1, '24H': 24, '7D': 168, '30D': 720 }
    const start = latest - (hours[historyRange] || 24) * 3600000
    return sorted.filter(item => {
      const time = new Date(item.recorded_at).getTime()
      return time >= start && time <= latest
    })
  }, [sensorReadings, historyRange])

  const chartData = useMemo(() => {
    const byTime = new Map()
    filteredSensorReadings.forEach(item => {
      const key = new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const row = byTime.get(key) || { time: key }
      if (item.sensor_type === 'temperature') row.temperature = Number(item.value)
      if (item.sensor_type === 'vibration') row.vibration = Number(item.value)
      if (item.sensor_type === 'voltage') row.voltage = Number(item.value)
      if (item.sensor_type === 'current') row.current = Number(item.value)
      byTime.set(key, row)
    })
    return [...byTime.values()].slice(-80)
  }, [filteredSensorReadings])

  const visibleTransformers = useMemo(() => transformers.filter(item => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = !search || [item.id, item.location, item.capacity, item.status].some(value => String(value || '').toLowerCase().includes(search))
    const matchesStatus = statusFilter === 'All' || String(item.status || '') === statusFilter
    return matchesSearch && matchesStatus
  }), [transformers, searchTerm, statusFilter])

  const statusCounts = useMemo(() => ({
    total: transformers.length,
    healthy: transformers.filter(t => String(t.status).toLowerCase() === 'healthy').length,
    warning: transformers.filter(t => String(t.status).toLowerCase() === 'warning').length,
    critical: transformers.filter(t => String(t.status).toLowerCase() === 'critical').length
  }), [transformers])

  const alertCounts = useMemo(() => ({
    active: alerts.filter(a => String(a.status || 'Active').toLowerCase() === 'active').length,
    critical: alerts.filter(a => String(a.severity || a.level || '').toLowerCase() === 'critical').length,
    warning: alerts.filter(a => String(a.severity || a.level || '').toLowerCase() === 'warning').length,
    resolved: alerts.filter(a => String(a.status || '').toLowerCase() === 'resolved').length
  }), [alerts])

  const formatDate = value => value ? new Date(value).toLocaleString() : '—'

  const openTransformer = transformer => {
    setSelectedTransformer(transformer)
    setDetailTab('Overview')
    setActivePage('TransformerDetail')
  }

  const resetTransformerForm = () => {
    setNewTransformerId('')
    setNewTransformerLocation('')
    setNewTransformerCapacity('')
    setNewTransformerStatus('Healthy')
    setNewTransformerLatitude('')
    setNewTransformerLongitude('')
  }

  const addTransformer = async event => {
    event.preventDefault()
    try {
      const response = await apiFetch(`${API}/api/transformers`, {
        method: 'POST',
        body: JSON.stringify({
          id: newTransformerId,
          location: newTransformerLocation,
          capacity: newTransformerCapacity,
          status: newTransformerStatus,
          latitude: Number(newTransformerLatitude),
          longitude: Number(newTransformerLongitude)
        })
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message || 'Unable to add transformer')
        return
      }
      setShowAddTransformer(false)
      resetTransformerForm()
      await loadTransformers()
    } catch (error) {
      console.error(error)
      alert('Unable to add transformer')
    }
  }

  const beginEdit = transformer => {
    setEditTransformer({ ...transformer })
    setShowEditTransformer(true)
  }

  const saveEditTransformer = async event => {
    event.preventDefault()
    if (!editTransformer?.id) return
    try {
      const response = await apiFetch(`${API}/api/transformers/${editTransformer.id}`, {
        method: 'PUT',
        body: JSON.stringify(editTransformer)
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message || 'Unable to update transformer')
        return
      }
      setShowEditTransformer(false)
      setEditTransformer(null)
      await loadTransformers()
    } catch (error) {
      console.error(error)
      alert('Unable to update transformer')
    }
  }

  const deleteTransformer = async transformer => {
    if (!window.confirm(`Delete ${transformer.id}?`)) return
    try {
      const response = await apiFetch(`${API}/api/transformers/${transformer.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message || 'Unable to delete transformer')
        return
      }
      if (String(selectedTransformer?.id) === String(transformer.id)) {
        setSelectedTransformer(null)
        setActivePage('Transformers')
      }
      await loadTransformers()
    } catch (error) {
      console.error(error)
      alert('Unable to delete transformer')
    }
  }

  const navItems = ['Dashboard', 'Transformers', 'Alerts', 'Devices', 'Fleet / HQ', 'System Health', 'Reports', 'Settings']

  if (!isLoggedIn) {
    return (
      <div className="app login-page">
        <div className="card login-card">
          <h1>GRIDPULSE-V</h1>
          <p>Edge-AI Transformer Monitoring Platform</p>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    )
  }

  const metricStatus = (value, warning, critical) => {
    if (value === null || value === undefined) return 'No data'
    if (value > critical) return 'Critical'
    if (value > warning) return 'Warning'
    return 'Normal'
  }

  const renderOverview = () => (
    <>
      <h3>Overview</h3>
      <p>Current condition summary for {selectedTransformer?.id}</p>
      <div className="cards">
        <div className="card"><h3>Health Score</h3><strong>{healthScore}%</strong><p>{healthRiskLevel} Risk</p></div>
        <div className="card"><h3>Oil Temperature</h3><strong>{currentTemperature !== null ? `${currentTemperature} °C` : 'No data'}</strong><p>{metricStatus(currentTemperature, temperatureThreshold, temperatureCriticalThreshold)}</p></div>
        <div className="card"><h3>Vibration</h3><strong>{currentVibration !== null ? `${currentVibration} mm/s` : 'Not connected'}</strong><p>{metricStatus(currentVibration, vibrationThreshold, vibrationCriticalThreshold)}</p></div>
        <div className="card"><h3>Voltage</h3><strong>{currentVoltage !== null ? `${currentVoltage} kV` : 'Not connected'}</strong><p>{metricStatus(currentVoltage, voltageThreshold, voltageCriticalThreshold)}</p></div>
        <div className="card"><h3>Current</h3><strong>{currentCurrent !== null ? `${currentCurrent} A` : 'Not connected'}</strong><p>{metricStatus(currentCurrent, currentThreshold, currentCriticalThreshold)}</p></div>
      </div>
      <div className="card">
        <h3>Transformer Information</h3>
        <p><strong>Transformer ID:</strong> {selectedTransformer?.id}</p>
        <p><strong>Location:</strong> {selectedTransformer?.location || '—'}</p>
        <p><strong>Capacity:</strong> {selectedTransformer?.capacity || '—'}</p>
        <p><strong>Status:</strong> {selectedTransformer?.status || 'Unknown'}</p>
        <p><strong>Data Source:</strong> PostgreSQL transformer and sensor records</p>
      </div>
    </>
  )

  const renderLiveMonitoring = () => (
    <>
      <h3>Live Monitoring</h3>
      <p>Real-time transformer condition monitoring</p>
      <div className="cards">
        <div className="card">
          <h3>Oil Temperature</h3>
          <strong>{currentTemperature !== null ? `${currentTemperature} °C` : 'No data'}</strong>
          <p>{temperatureMonitoring ? currentTemperature !== null ? `Backend data • ${metricStatus(currentTemperature, temperatureThreshold, temperatureCriticalThreshold)}` : 'Backend data • No data' : 'Monitoring Disabled'}</p>
        </div>
        {temperatureMonitoring && alertNotifications && currentTemperature !== null && currentTemperature > temperatureThreshold && (
          <div className="card"><h3>Temperature Alert</h3><p>Oil temperature is above the configured warning threshold.</p><strong>{currentTemperature} °C &gt; {temperatureThreshold} °C</strong></div>
        )}
        {temperatureMonitoring && alertNotifications && currentTemperature !== null && currentTemperature > temperatureCriticalThreshold && (
          <div className="card"><h3>🚨 Critical Temperature Alert</h3><p>Oil temperature is above the configured critical threshold.</p><strong>{currentTemperature} °C &gt; {temperatureCriticalThreshold} °C</strong></div>
        )}
        <div className="card"><h3>Vibration</h3><strong>{currentVibration !== null ? `${currentVibration} mm/s` : 'Not connected'}</strong><p>{currentVibration !== null ? 'Backend data • Connected' : 'MPU6050 not connected'}</p></div>
        <div className="card"><h3>Voltage</h3><strong>{currentVoltage !== null ? `${currentVoltage} kV` : 'Not connected'}</strong><p>{currentVoltage !== null ? 'Backend data • Connected' : 'ZMPT101B not connected'}</p></div>
        <div className="card"><h3>Current</h3><strong>{currentCurrent !== null ? `${currentCurrent} A` : 'Not connected'}</strong><p>{currentCurrent !== null ? 'Backend data • Connected' : 'ACS712 not connected'}</p></div>
        <div className="card"><h3>Humidity</h3><strong>{currentHumidity !== null ? `${currentHumidity} %` : 'Not connected'}</strong><p>{currentHumidity !== null ? 'Backend data • Connected' : 'DHT11 not connected'}</p></div>
        <div className="card"><h3>Acoustic Level</h3><strong>{currentAcoustic !== null ? `${currentAcoustic} dB` : 'Not connected'}</strong><p>{currentAcoustic !== null ? 'Backend data • Connected' : 'Acoustic sensor not connected'}</p></div>
        <div className="card">
          <h3>Monitoring Status</h3>
          <p>● Device communication: {devices.find(d => String(d.transformer_id) === String(selectedTransformer?.id))?.status || 'Unknown'}</p>
          <p>● Sensor communication: {sensorReadings.length > 0 ? 'Normal' : 'No recent data'}</p>
          <p>● Temperature Monitoring: {currentTemperature !== null ? 'Connected' : 'Not connected'}</p>
          <p>● Vibration Monitoring: {currentVibration !== null ? 'Connected' : 'Not connected'}</p>
          <p>● Voltage Monitoring: {currentVoltage !== null ? 'Connected' : 'Not connected'}</p>
          <p>● Current Monitoring: {currentCurrent !== null ? 'Connected' : 'Not connected'}</p>
          <p>● Acoustic Monitoring: {currentAcoustic !== null ? 'Connected' : 'Not connected'}</p>
          <p>● Data source: ESP32 → PostgreSQL</p>
        </div>
      </div>
    </>
  )

  const renderTrends = () => (
    <>
      <h3>Trends &amp; History</h3>
      <p>Historical sensor records for {selectedTransformer?.id}</p>
      <div className="button-row">
        {['1H', '24H', '7D', '30D'].map(range => <button key={range} onClick={() => setHistoryRange(range)}>{range}</button>)}
      </div>
      <div className="card" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" name="Temperature °C" dot={false} />
            <Line type="monotone" dataKey="vibration" name="Vibration mm/s" dot={false} />
            <Line type="monotone" dataKey="voltage" name="Voltage kV" dot={false} />
            <Line type="monotone" dataKey="current" name="Current A" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p>Data Source: PostgreSQL sensor records</p>
      <div className="card"><h3>Latest Sensor Record</h3><pre>{JSON.stringify(latestSensorReading, null, 2)}</pre></div>
    </>
  )

  const renderEvents = () => (
    <>
      <h3>Events</h3>
      <p>Transformer events and condition alerts</p>
      {eventRecords.length === 0 ? <div className="card"><p>No records</p></div> : <div className="card"><table><thead><tr><th>Time</th><th>Type</th><th>Severity</th><th>Status</th><th>Message</th></tr></thead><tbody>{eventRecords.map((event, index) => <tr key={event.id || index}><td>{formatDate(event.created_at || event.recorded_at)}</td><td>{event.type || event.alert_type || 'Alert'}</td><td>{event.severity || event.level || '—'}</td><td>{event.status || 'Active'}</td><td>{event.message || event.description || '—'}</td></tr>)}</tbody></table></div>}
    </>
  )

  const renderAIAnalysis = () => (
    <>
      <h3>AI Analysis</h3>
      <p>Edge-AI condition analysis for this transformer</p>
      <div className="cards">
        <div className="card"><h3>Health Score</h3><strong>{healthScore}%</strong><p>{healthRiskLevel} Risk</p></div>
        <div className="card"><h3>Analysis Status</h3><strong>{analysisStatus}</strong><p>Based on available backend sensor data</p></div>
        <div className="card"><h3>Anomaly Detection</h3><strong>{anomalyDetected ? 'Detected' : 'No anomaly'}</strong><p>Threshold-based condition screening</p></div>
      </div>
      <div className="card"><h3>AI Recommendation</h3><p>{anomalyDetected ? 'Inspect the parameters that exceed their configured thresholds and verify the transformer condition.' : 'Continue normal monitoring. No configured threshold anomaly is currently detected.'}</p></div>
      <div className="card"><h3>Edge-AI Status</h3><p>Risk-score pipeline ready for TinyML/Edge-AI integration.</p><p>Current POC uses PostgreSQL sensor records and configured condition thresholds.</p></div>
    </>
  )

  const renderHealthPassport = () => (
    <>
      <h3>Health Passport</h3>
      <p>Digital condition history and identity record</p>
      <div className="card">
        <h3>Transformer Identity</h3>
        <p><strong>Transformer ID:</strong> {selectedTransformer?.id}</p>
        <p><strong>Location:</strong> {selectedTransformer?.location || '—'}</p>
        <p><strong>Capacity:</strong> {selectedTransformer?.capacity || '—'}</p>
        <p><strong>Status:</strong> {selectedTransformer?.status || 'Unknown'}</p>
        <p><strong>Data Source:</strong> ESP32 → PostgreSQL</p>
      </div>
      <div className="card">
        <h3>Current Health</h3>
        <p><strong>Health Score:</strong> {healthScore}%</p>
        <p><strong>Risk Level:</strong> {healthRiskLevel}</p>
        <p><strong>Temperature:</strong> {currentTemperature ?? 'No data'} °C</p>
        <p><strong>Vibration:</strong> {currentVibration ?? 'No data'} mm/s</p>
        <p><strong>Voltage:</strong> {currentVoltage ?? 'No data'} kV</p>
        <p><strong>Current:</strong> {currentCurrent ?? 'No data'} A</p>
      </div>
    </>
  )

  const renderMaintenance = () => (
    <>
      <h3>Maintenance</h3>
      <p>Maintenance records for {selectedTransformer?.id}</p>
      {maintenanceRecords.length === 0 ? <div className="card"><p>No maintenance records available.</p></div> : <div className="card"><table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Status</th></tr></thead><tbody>{maintenanceRecords.map((item, index) => <tr key={item.id || index}><td>{formatDate(item.date || item.created_at)}</td><td>{item.type || item.maintenance_type || 'Maintenance'}</td><td>{item.description || item.notes || '—'}</td><td>{item.status || '—'}</td></tr>)}</tbody></table></div>}
    </>
  )

  const renderBeforeAfter = () => (
    <>
      <h3>Before / After</h3>
      <p>Condition comparison for maintenance analysis</p>
      <div className="cards">
        <div className="card"><h3>Before</h3><p>Historical condition data can be compared here after maintenance records are available.</p></div>
        <div className="card"><h3>After</h3><p>Latest PostgreSQL sensor readings are used for the current condition.</p></div>
      </div>
      <div className="card"><h3>Current Snapshot</h3><p>Temperature: {currentTemperature ?? 'No data'} °C</p><p>Vibration: {currentVibration ?? 'No data'} mm/s</p><p>Voltage: {currentVoltage ?? 'No data'} kV</p><p>Current: {currentCurrent ?? 'No data'} A</p></div>
    </>
  )

  const renderQRProfile = () => (
    <>
      <h3>QR Profile</h3>
      <p>Digital identification profile for this transformer</p>
      <div className="card">
        <h3>Transformer Identity</h3>
        <p><strong>Transformer ID:</strong> {selectedTransformer?.id || 'No transformer selected'}</p>
        <p><strong>Location:</strong> {selectedTransformer?.location || 'No location'}</p>
        <p><strong>Capacity:</strong> {selectedTransformer?.capacity || 'No capacity'}</p>
        <p><strong>Status:</strong> {selectedTransformer?.status || 'Unknown'}</p>
      </div>
      <div className="card">
        <h3>QR Profile Information</h3>
        <p><strong>QR Code ID:</strong> {selectedTransformer?.id || 'No transformer selected'}</p>
        <p>Scan this QR code to quickly open the digital monitoring profile for this transformer.</p>
        <div className="qr-code-container">
          <QRCodeSVG value={`http://localhost:5173/?transformer=${encodeURIComponent(selectedTransformer?.id || '')}`} size={200} />
        </div>
        <p>Scanning this QR profile can be used to quickly identify this transformer and access its digital monitoring information.</p>
        <p><strong>Status:</strong> QR code generated.</p>
      </div>
      <div className="card"><h3>Data Source</h3><p>PostgreSQL transformer records.</p></div>
    </>
  )

  const renderTransformerDetail = () => {
    if (!selectedTransformer) return null
    return (
      <>
        <h2>Transformer Overview</h2>
        <p>Detailed information for {selectedTransformer.id}</p>
        <div className="detail-tabs">
          {['Overview', 'Live Monitoring', 'Trends & History', 'Events', 'AI Analysis', 'Health Passport', 'Maintenance', 'Before / After', 'QR Profile'].map(tab => (
            <button key={tab} onClick={() => setDetailTab(tab)}>{tab}</button>
          ))}
        </div>
        {detailTab === 'Overview' && renderOverview()}
        {detailTab === 'Live Monitoring' && renderLiveMonitoring()}
        {detailTab === 'Trends & History' && renderTrends()}
        {detailTab === 'Events' && renderEvents()}
        {detailTab === 'AI Analysis' && renderAIAnalysis()}
        {detailTab === 'Health Passport' && renderHealthPassport()}
        {detailTab === 'Maintenance' && renderMaintenance()}
        {detailTab === 'Before / After' && renderBeforeAfter()}
        {detailTab === 'QR Profile' && renderQRProfile()}
      </>
    )
  }

  const renderDashboard = () => (
    <>
      <h2>Welcome to GRIDPULSE-V</h2>
      <p>Edge-AI-based non-invasive predictive maintenance and transformer monitoring</p>
      <div className="cards">
        <div className="card"><h3>Total Transformers</h3><strong>{statusCounts.total}</strong></div>
        <div className="card"><h3>Healthy</h3><strong>{statusCounts.healthy}</strong></div>
        <div className="card"><h3>Warnings</h3><strong>{statusCounts.warning}</strong></div>
        <div className="card"><h3>Critical</h3><strong>{statusCounts.critical}</strong></div>
      </div>
      <div className="card">
        <h3>Recent Alerts</h3>
        {alerts.length === 0 ? <p>No recent alerts</p> : <table><thead><tr><th>Time</th><th>Transformer</th><th>Message</th><th>Severity</th><th>Status</th></tr></thead><tbody>{alerts.slice(0, 10).map((alert, index) => <tr key={alert.id || index}><td>{formatDate(alert.created_at || alert.recorded_at)}</td><td>{alert.transformer_id || alert.transformerId || alert.transformer || '—'}</td><td>{alert.message || alert.description || alert.alert_type || 'Alert'}</td><td>{alert.severity || alert.level || '—'}</td><td>{alert.status || 'Active'}</td></tr>)}</tbody></table>}
      </div>
      <p>Data Source: PostgreSQL alert records</p>
    </>
  )

  const renderTransformers = () => (
    <>
      <div className="page-header"><div><h2>Transformer Management</h2><p>Monitor and manage connected distribution transformers.</p></div><button onClick={() => setShowAddTransformer(true)}>+ Add Transformer</button></div>
      <div className="filters">
        <input placeholder="Search transformers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option><option>Healthy</option><option>Warning</option><option>Critical</option></select>
      </div>
      <div className="card"><table><thead><tr><th>ID</th><th>Location</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleTransformers.map(transformer => <tr key={transformer.id}><td>{transformer.id}</td><td>{transformer.location}</td><td>{transformer.capacity}</td><td>{transformer.status}</td><td><button onClick={() => openTransformer(transformer)}>Open</button>{' '}<button onClick={() => beginEdit(transformer)}>Edit</button>{' '}<button onClick={() => deleteTransformer(transformer)}>Delete</button></td></tr>)}</tbody></table></div>
      <p>Data Source: PostgreSQL transformer records</p>
    </>
  )

  const renderAlerts = () => (
    <>
      <h2>Alerts</h2><p>Transformer alerts and condition notifications</p>
      <div className="cards"><div className="card"><h3>Active Alerts</h3><strong>{alertCounts.active}</strong></div><div className="card"><h3>Critical</h3><strong>{alertCounts.critical}</strong></div><div className="card"><h3>Warnings</h3><strong>{alertCounts.warning}</strong></div><div className="card"><h3>Resolved Today</h3><strong>{alertCounts.resolved}</strong></div></div>
      <div className="card"><table><thead><tr><th>Time</th><th>Transformer</th><th>Message</th><th>Severity</th><th>Status</th></tr></thead><tbody>{alerts.map((alert, index) => <tr key={alert.id || index}><td>{formatDate(alert.created_at || alert.recorded_at)}</td><td>{alert.transformer_id || alert.transformerId || alert.transformer || '—'}</td><td>{alert.message || alert.description || alert.alert_type || 'Alert'}</td><td>{alert.severity || alert.level || '—'}</td><td>{alert.status || 'Active'}</td></tr>)}</tbody></table></div>
      <p>Data Source: PostgreSQL alert records</p>
    </>
  )

  const renderDevices = () => (
    <>
      <h2>Devices</h2><p>Connected field devices and communication status</p>
      <div className="card"><table><thead><tr><th>Device</th><th>Transformer</th><th>Type</th><th>Status</th><th>Last Seen</th></tr></thead><tbody>{devices.map((device, index) => <tr key={device.id || index}><td>{device.device_id || device.id || '—'}</td><td>{device.transformer_id || '—'}</td><td>{device.device_type || device.type || 'ESP32'}</td><td>{device.status || 'Unknown'}</td><td>{formatDate(device.last_seen || device.updated_at)}</td></tr>)}</tbody></table></div>
      <p>Data Source: PostgreSQL device records</p>
    </>
  )

  const renderFleet = () => (
    <>
      <h2>Fleet / HQ</h2><p>Transformer fleet location and status</p>
      <div className="card" style={{ height: 520 }}>
        <MapContainer center={[13.0827, 80.2707]} zoom={9} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {transformers.filter(t => t.latitude != null && t.longitude != null).map(transformer => <Marker key={transformer.id} position={[Number(transformer.latitude), Number(transformer.longitude)]}><Popup><strong>{transformer.id}</strong><br />{transformer.location}<br />{transformer.capacity}<br />Status: {transformer.status}<br />📍 Coordinates: {transformer.latitude}, {transformer.longitude}</Popup></Marker>)}
        </MapContainer>
      </div>
      <p>Data Source: PostgreSQL transformer records</p>
    </>
  )

  const renderSystemHealth = () => (
    <>
      <h2>System Health</h2><p>GRIDPULSE-V platform health and backend connectivity</p>
      <div className="cards"><div className="card"><h3>Frontend</h3><strong>Online</strong></div><div className="card"><h3>Backend</h3><strong>Connected</strong></div><div className="card"><h3>Database</h3><strong>PostgreSQL</strong></div><div className="card"><h3>Sensor Data</h3><strong>{sensorReadings.length ? 'Receiving' : 'No recent data'}</strong></div></div>
      <div className="card"><h3>Platform Information</h3><p>ESP32 → Backend API → PostgreSQL → GRIDPULSE-V dashboard</p><p>Automatic refresh: {autoRefresh ? 'Enabled' : 'Disabled'}</p></div>
      <p>Data Source: GRIDPULSE-V platform and PostgreSQL records</p>
    </>
  )

  const renderReports = () => (
    <>
      <h2>Reports</h2><p>Generate and review GRIDPULSE-V monitoring reports.</p>
      <div className="button-row">{['Health', 'Alerts', 'Maintenance', 'Fleet'].map(type => <button key={type} onClick={() => setReportType(type)}>{type} Report</button>)}</div>
      <div className="card">
        <h3>{reportType} Report</h3>
        {reportType === 'Health' && <><p>Transformer count: {transformers.length}</p><p>Healthy: {statusCounts.healthy}</p><p>Warning: {statusCounts.warning}</p><p>Critical: {statusCounts.critical}</p><p>Selected transformer health score: {selectedTransformer ? `${healthScore}%` : '—'}</p></>}
        {reportType === 'Alerts' && <><p>Total alerts: {alerts.length}</p><p>Critical alerts: {alertCounts.critical}</p><p>Warnings: {alertCounts.warning}</p><p>Active alerts: {alertCounts.active}</p></>}
        {reportType === 'Maintenance' && <><p>Maintenance reports: {maintenanceReports.length}</p>{maintenanceReports.slice(0, 10).map((item, index) => <p key={item.id || index}>{formatDate(item.created_at || item.date)} — {item.description || item.notes || 'Maintenance record'}</p>)}</>}
        {reportType === 'Fleet' && <><p>Total transformers: {transformers.length}</p>{transformers.map(t => <p key={t.id}>{t.id} — {t.location} — {t.status}</p>)}</>}
      </div>
    </>
  )

  const renderSettings = () => (
    <>
      <h2>Settings</h2><p>Configure GRIDPULSE-V monitoring behavior and thresholds.</p>
      <div className="card">
        <h3>Monitoring Configuration</h3>
        <table><thead><tr><th>Setting</th><th>Current Value</th><th>Description</th></tr></thead><tbody>
          <tr><td>Temperature Monitoring</td><td><button onClick={() => setTemperatureMonitoring(v => !v)}>{temperatureMonitoring ? 'Enabled' : 'Disabled'}</button></td><td>Monitor transformer temperature</td></tr>
          <tr><td>Vibration Monitoring</td><td><button onClick={() => setVibrationMonitoring(v => !v)}>{vibrationMonitoring ? 'Enabled' : 'Disabled'}</button></td><td>Monitor transformer vibration</td></tr>
          <tr><td>Alert Notifications</td><td><button onClick={() => setAlertNotifications(v => !v)}>{alertNotifications ? 'Enabled' : 'Disabled'}</button></td><td>Display transformer condition alerts</td></tr>
          <tr><td>Automatic Data Refresh</td><td><button onClick={() => setAutoRefresh(v => !v)}>{autoRefresh ? 'Enabled' : 'Disabled'}</button></td><td>Refresh monitoring information automatically</td></tr>
          <tr><td>Temperature Warning Threshold</td><td><input type="number" value={temperatureThreshold} onChange={e => setTemperatureThreshold(Number(e.target.value))} style={{ width: 90 }} /> °C</td><td>Temperature level used for warning detection</td></tr>
          <tr><td>Temperature Critical Threshold</td><td><input type="number" value={temperatureCriticalThreshold} onChange={e => setTemperatureCriticalThreshold(Number(e.target.value))} style={{ width: 90 }} /> °C</td><td>Temperature level used for critical condition detection</td></tr>
          <tr><td>Vibration Warning Threshold</td><td><input type="number" step="0.1" value={vibrationThreshold} onChange={e => setVibrationThreshold(Number(e.target.value))} style={{ width: 90 }} /> mm/s</td><td>Vibration level used for warning detection</td></tr>
          <tr><td>Vibration Critical Threshold</td><td><input type="number" step="0.1" value={vibrationCriticalThreshold} onChange={e => setVibrationCriticalThreshold(Number(e.target.value))} style={{ width: 90 }} /> mm/s</td><td>Vibration level used for critical condition detection</td></tr>
          <tr><td>Voltage Warning Threshold</td><td><input type="number" step="0.1" value={voltageThreshold} onChange={e => setVoltageThreshold(Number(e.target.value))} style={{ width: 90 }} /> kV</td><td>Voltage level used for warning detection</td></tr>
          <tr><td>Voltage Critical Threshold</td><td><input type="number" step="0.1" value={voltageCriticalThreshold} onChange={e => setVoltageCriticalThreshold(Number(e.target.value))} style={{ width: 90 }} /> kV</td><td>Voltage level used for critical detection</td></tr>
          <tr><td>Current Warning Threshold</td><td><input type="number" value={currentThreshold} onChange={e => setCurrentThreshold(Number(e.target.value))} style={{ width: 90 }} /> A</td><td>Current level used for warning detection</td></tr>
          <tr><td>Current Critical Threshold</td><td><input type="number" value={currentCriticalThreshold} onChange={e => setCurrentCriticalThreshold(Number(e.target.value))} style={{ width: 90 }} /> A</td><td>Current level used for critical detection</td></tr>
        </tbody></table>
      </div>
      <div className="card"><h3>Data Source</h3><p>Data Source: PostgreSQL-backed monitoring configuration</p></div>
      <div className="card"><h3>System Mode</h3><p>Demo</p><p>Settings are applied to the current monitoring session.</p></div>
      <div className="card"><h3>Account</h3><p>{loggedInUser?.email || email || 'Logged in user'}</p><button onClick={handleLogout}>Logout</button></div>
    </>
  )

  const renderPage = () => {
    if (activePage === 'Dashboard') return renderDashboard()
    if (activePage === 'Transformers') return renderTransformers()
    if (activePage === 'Alerts') return renderAlerts()
    if (activePage === 'Devices') return renderDevices()
    if (activePage === 'Fleet / HQ') return renderFleet()
    if (activePage === 'System Health') return renderSystemHealth()
    if (activePage === 'Reports') return renderReports()
    if (activePage === 'Settings') return renderSettings()
    if (activePage === 'TransformerDetail') return renderTransformerDetail()
    return renderDashboard()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div><strong>GRIDPULSE-V</strong><span> Edge-AI Transformer Monitoring</span></div>
        <div>{loggedInUser?.email || 'Administrator'} <button onClick={handleLogout}>Logout</button></div>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          {navItems.map(item => <button key={item} className={activePage === item ? 'active' : ''} onClick={() => setActivePage(item)}>{item}</button>)}
          {activePage === 'TransformerDetail' && <button className="active" onClick={() => setActivePage('TransformerDetail')}>Transformer Detail</button>}
        </aside>
        <main className="content">
          {renderPage()}
        </main>
      </div>

      {showAddTransformer && (
        <div className="modal-backdrop"><div className="card modal">
          <h2>Add Transformer</h2>
          <form onSubmit={addTransformer}>
            <input placeholder="Transformer ID" value={newTransformerId} onChange={e => setNewTransformerId(e.target.value)} required />
            <input placeholder="Location" value={newTransformerLocation} onChange={e => setNewTransformerLocation(e.target.value)} required />
            <input placeholder="Capacity" value={newTransformerCapacity} onChange={e => setNewTransformerCapacity(e.target.value)} required />
            <select value={newTransformerStatus} onChange={e => setNewTransformerStatus(e.target.value)}><option>Healthy</option><option>Warning</option><option>Critical</option></select>
            <input placeholder="Latitude" value={newTransformerLatitude} onChange={e => setNewTransformerLatitude(e.target.value)} />
            <input placeholder="Longitude" value={newTransformerLongitude} onChange={e => setNewTransformerLongitude(e.target.value)} />
            <button type="submit">Save</button><button type="button" onClick={() => { setShowAddTransformer(false); resetTransformerForm() }}>Cancel</button>
          </form>
        </div></div>
      )}

      {showEditTransformer && editTransformer && (
        <div className="modal-backdrop"><div className="card modal">
          <h2>Edit Transformer</h2>
          <form onSubmit={saveEditTransformer}>
            <input value={editTransformer.id || ''} disabled />
            <input placeholder="Location" value={editTransformer.location || ''} onChange={e => setEditTransformer({ ...editTransformer, location: e.target.value })} />
            <input placeholder="Capacity" value={editTransformer.capacity || ''} onChange={e => setEditTransformer({ ...editTransformer, capacity: e.target.value })} />
            <select value={editTransformer.status || 'Healthy'} onChange={e => setEditTransformer({ ...editTransformer, status: e.target.value })}><option>Healthy</option><option>Warning</option><option>Critical</option></select>
            <input placeholder="Latitude" value={editTransformer.latitude ?? ''} onChange={e => setEditTransformer({ ...editTransformer, latitude: e.target.value })} />
            <input placeholder="Longitude" value={editTransformer.longitude ?? ''} onChange={e => setEditTransformer({ ...editTransformer, longitude: e.target.value })} />
            <button type="submit">Save Changes</button><button type="button" onClick={() => { setShowEditTransformer(false); setEditTransformer(null) }}>Cancel</button>
          </form>
        </div></div>
      )}
    </div>
  )
}

export default App
