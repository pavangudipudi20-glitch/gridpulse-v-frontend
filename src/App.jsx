import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
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
import './App.css'
import 'leaflet/dist/leaflet.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
 const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem('gridpulse_logged_in') === 'true' &&
  Boolean(localStorage.getItem('gridpulse_token'))
)
  const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loggedInUser, setLoggedInUser] = useState(null)
const [showAddTransformer, setShowAddTransformer] = useState(false)
const [showEditTransformer, setShowEditTransformer] = useState(false)
const [editTransformer, setEditTransformer] = useState(null)
const [newTransformerId, setNewTransformerId] = useState('')
const [newTransformerLocation, setNewTransformerLocation] = useState('')
const [newTransformerCapacity, setNewTransformerCapacity] = useState('')
const [newTransformerStatus, setNewTransformerStatus] = useState('Healthy')
const [newTransformerLatitude, setNewTransformerLatitude] = useState('')
const [newTransformerLongitude, setNewTransformerLongitude] = useState('')
const handleLogin = async () => {
  try {
    const response = await fetch('https://gridpulse-v-backend.onrender.com/api/transformers', {
  method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await response.json()
if (response.ok) {
  localStorage.setItem('gridpulse_logged_in', 'true')
  setLoggedInUser(data.user)
  localStorage.setItem('gridpulse_token', data.token)
localStorage.setItem('gridpulse_user', JSON.stringify(data.user))
setIsLoggedIn(true)
}
     else {
      alert(data.message)
    }
  } catch (error) {
    console.error('Login error:', error)
    alert('Unable to connect to the GRIDPULSE-V server')
  }
}
  const [selectedTransformer, setSelectedTransformer] = useState(null)
  const [showHealthReport, setShowHealthReport] = useState(false)
  const [showAlertReport, setShowAlertReport] = useState(false)
  const [showMaintenanceReport, setShowMaintenanceReport] = useState(false)
  const [showFleetReport, setShowFleetReport] = useState(false)
  const [temperatureMonitoring, setTemperatureMonitoring] = useState(true)
  const [vibrationMonitoring, setVibrationMonitoring] = useState(true)
  const [alertNotifications, setAlertNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [temperatureThreshold, setTemperatureThreshold] = useState(70)
  const [temperatureCriticalThreshold, setTemperatureCriticalThreshold] = useState(85)
  const [vibrationThreshold, setVibrationThreshold] = useState(3.0)
  const [vibrationCriticalThreshold, setVibrationCriticalThreshold] = useState(5.0)   
  const [detailTab, setDetailTab] = useState('Overview')
  const [historyRange, setHistoryRange] = useState('24H')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [liveTransformers, setLiveTransformers] = useState([])
  const [sensorReadings, setSensorReadings] = useState([])
  const [eventRecords, setEventRecords] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [maintenanceReports, setMaintenanceReports] = useState([])
  const [devices, setDevices] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
  const fetchTransformers = () => {
  fetch('https://gridpulse-v-backend.onrender.com/api/transformers', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('gridpulse_token') || ''}`
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Transformers received:', data)
      setLiveTransformers(Array.isArray(data) ? data : [])
    })
    .catch((error) => {
      console.error('Failed to fetch transformers:', error)
      setLiveTransformers([])
    })
}
  fetchTransformers()

  if (autoRefresh) {
    const refreshInterval = setInterval(() => {
      fetchTransformers()
    }, 30000)

    return () => clearInterval(refreshInterval)
  }
}, [autoRefresh])
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const transformerId = params.get('transformer')

  if (!transformerId || liveTransformers.length === 0) {
    return
  }

  const transformer = liveTransformers.find(
    (item) => item.id === transformerId
  )

  if (transformer) {
    setSelectedTransformer(transformer)
    setActivePage('TransformerDetail')
  }
}, [liveTransformers])
useEffect(() => {
  if (!selectedTransformer) {
    setSensorReadings([])
    return
  }

  useEffect(() => {
  const fetchSensorReadings = async () => {
    try {
      const response = await fetch(
        `https://gridpulse-v-backend.onrender.com/api/sensor-readings/${selectedTransformer.id}`,
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('gridpulse_token') || ''
            }`
          }
        }
      )

      const data = await response.json()

      console.log('Sensor readings response status:', response.status)
      console.log('Sensor data received:', data)
      console.log('First sensor record:', data[0])

      if (!response.ok) {
        console.error('Failed to fetch sensor readings:', data)
        setSensorReadings([])
        return
      }

      setSensorReadings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Sensor readings error:', error)
      setSensorReadings([])
    }
  }

  if (selectedTransformer) {
    fetchSensorReadings()
  }
}, [selectedTransformer])
  
  useEffect(() => {
  fetch('https://gridpulse-v-backend.onrender.com/api/devices')
    .then((response) => response.json())
    .then((data) => {
      console.log('Devices received:', data)
      setDevices(data)
    })
    .catch((error) => {
      console.error('Failed to fetch devices:', error)
    })
}, [])

useEffect(() => {
  fetch('https://gridpulse-v-backend.onrender.com/api/alerts', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('gridpulse_token') || ''}`
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Alerts received:', data)
      setAlerts(Array.isArray(data) ? data : [])
    })
    .catch((error) => {
      console.error('Failed to fetch alerts:', error)
      setAlerts([])
    })
}, [])
useEffect(() => {
  const fetchMaintenanceReports = async () => {
    try {
      const response = await fetch(
        'https://gridpulse-v-backend.onrender.com/api/maintenance'
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(
          'Failed to fetch maintenance reports:',
          data
        )
        return
      }

      console.log(
        'Maintenance reports received:',
        data
      )

      setMaintenanceReports(data)
    } catch (error) {
      console.error(
        'Maintenance reports error:',
        error
      )
    }
  }

  fetchMaintenanceReports()
}, [])
if (!isLoggedIn) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>GRIDPULSE-V</h1>
        <p>Transformer Monitoring & Predictive Maintenance</p>
<input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
        <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
<button onClick={handleLogin}>
  Login
</button>
        <small>
          DEMO LOGIN — Authentication will be connected to the backend later.
        </small>
      </div>
    </div>
     )
}

  const filteredSensorReadings = (() => {
    if (sensorReadings.length === 0) {
      return []
    }

    const latestTime = new Date(
      sensorReadings[sensorReadings.length - 1].recorded_at
    ).getTime()

    const hours = {
      '1H': 1,
      '24H': 24,
      '7D': 24 * 7,
      '30D': 24 * 30
    }

    const rangeMilliseconds =
      (hours[historyRange] || 24) * 60 * 60 * 1000

    return sensorReadings.filter((reading) => {
      const readingTime = new Date(reading.recorded_at).getTime()

      return latestTime - readingTime <= rangeMilliseconds
    })
  })()

const getLatestFieldValue = (fieldName) => {
  if (!Array.isArray(sensorReadings) || sensorReadings.length === 0) {
    return null
  }

  const sortedReadings = [...sensorReadings].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() -
      new Date(a.recorded_at).getTime()
  )

  const readingWithValue = sortedReadings.find(
    (item) =>
      item[fieldName] !== null &&
      item[fieldName] !== undefined &&
      item[fieldName] !== '' &&
      !Number.isNaN(Number(item[fieldName]))
  )

  return readingWithValue ? Number(readingWithValue[fieldName]) : null
}
const latestSensorReading =
  Array.isArray(sensorReadings) && sensorReadings.length > 0
    ? [...sensorReadings].sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() -
          new Date(a.recorded_at).getTime()
      )[0]
    : null
  const currentTemperature = getLatestFieldValue('temperature_c')
const currentVibration = getLatestFieldValue('vibration_mm_s')
const currentVoltage = getLatestFieldValue('voltage_kv')
const currentCurrent = getLatestFieldValue('current_a')
const currentHumidity = getLatestFieldValue('humidity_percent')
const currentAcoustic = getLatestFieldValue('acoustic_db')
const voltageThreshold = 11.0
const voltageCriticalThreshold = 11.5

let healthScore = 100
  if (currentTemperature !== null) {
    healthScore -= Math.min(
      5,
      (currentTemperature / temperatureThreshold) * 5
    )
  }

  if (currentVibration !== null) {
    healthScore -= Math.min(
      5,
      (currentVibration / vibrationThreshold) * 5
    )
  }

  healthScore = Math.round(Math.max(0, healthScore))

  const healthRiskLevel =
    healthScore >= 80
      ? 'Low'
      : healthScore >= 50
      ? 'Medium'
      : 'High'

  const anomalyDetected =
    currentTemperature !== null &&
    currentVibration !== null &&
    (
      currentTemperature > temperatureThreshold ||
      currentVibration > vibrationThreshold
    )

  return (
    <div className="app">

      {/* TOP HEADER */}
      <header  className="topbar">
        <h1>GRIDPULSE-V</h1>
          {loggedInUser && (
  <div className="user-info">
    <strong>{loggedInUser.name}</strong>
    <span>{loggedInUser.role}</span>

    <button
      onClick={() => {
        localStorage.removeItem('gridpulse_logged_in')
        setLoggedInUser(null)
        setIsLoggedIn(false)
      }}
    >
      Logout
    </button>
  </div>
)}

<span>Transformer Monitoring & Predictive Maintenance</span>
</header>

      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <button onClick={() => setActivePage('Dashboard')}>
            Dashboard
          </button>

          <button onClick={() => setActivePage('Transformers')}>
            Transformers
          </button>
<button onClick={() => setActivePage('Alerts')}>
  Alerts
</button>
          <button onClick={() => setActivePage('Devices')}>
  Devices
</button>
<button onClick={() => setActivePage('Fleet')}>
  Fleet / HQ
</button>
          <button onClick={() => setActivePage('SystemHealth')}>
  System Health
</button>
         <button onClick={() => setActivePage('Reports')}>
  Reports
</button> 
<button onClick={() => setActivePage('Settings')}>
  Settings
</button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">

          {/* ================= DASHBOARD ================= */}

          {activePage === 'Dashboard' && (
            <>
              <h2>Dashboard</h2>

              <p>
                Welcome to GRIDPULSE-V
              </p>

              <div className="cards">
<div className="card">
  <h3>Total Transformers</h3>
<strong>{liveTransformers.length}</strong>
</div>
                <div className="card">
                  <h3>Healthy</h3>
                <strong>{(Array.isArray(liveTransformers) ? liveTransformers : []).filter(t => t.status === 'Healthy').length}</strong>  
                </div>

                <div className="card">
                  <h3>Warnings</h3>
                  <strong>{(Array.isArray(liveTransformers) ? liveTransformers : []).filter(t => t.status === 'Warning').length}</strong>
                </div>

                <div className="card">
                  <h3>Critical</h3>
                  <strong>{(Array.isArray(liveTransformers) ? liveTransformers : []).filter(t => t.status === 'Critical').length}</strong>
                </div>
                {/* ================= RECENT ALERTS ================= */}

<div className="card">

  <h3>Recent Alerts</h3>

  <table>

    <thead>
      <tr>
        <th>Time</th>
        <th>Transformer</th>
        <th>Alert</th>
        <th>Severity</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
  {alerts.map((alert) => (
    <tr key={alert.id}>
      <td>
        {new Date(alert.alert_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>

      <td>{alert.transformer_id}</td>

      <td>{alert.alert_type}</td>

      <td>
        <span
          className={`status-badge ${alert.severity.toLowerCase()}`}
        >
          {alert.severity}
        </span>
      </td>

      <td>{alert.status}</td>
    </tr>
  ))}
</tbody>

  </table>

  
</div>
              </div>
            </>
          )}

          {/* ================= TRANSFORMERS ================= */}

          {activePage === 'Transformers' && (
            <>
              <h2>Transformers</h2>

              <p>
                Transformer monitoring and management
              </p>
            <button
  onClick={() => setShowAddTransformer(true)}
>
  + Add Transformer
</button>
          {showAddTransformer && (
  <div className="card">
    <h3>Add New Transformer</h3>

    <input
      type="text"
      placeholder="Transformer ID (e.g. TR-005)"
      value={newTransformerId}
      onChange={(e) => setNewTransformerId(e.target.value)}
    />

    <input
      type="text"
      placeholder="Location"
      value={newTransformerLocation}
      onChange={(e) => setNewTransformerLocation(e.target.value)}
    />

    <input
      type="number"
      placeholder="Capacity (kVA)"
      value={newTransformerCapacity}
      onChange={(e) => setNewTransformerCapacity(e.target.value)}
    />

    <select
      value={newTransformerStatus}
      onChange={(e) => setNewTransformerStatus(e.target.value)}
    >
      <option value="Healthy">Healthy</option>
      <option value="Warning">Warning</option>
      <option value="Critical">Critical</option>
    </select>

    <input
      type="number"
      step="any"
      placeholder="Latitude"
      value={newTransformerLatitude}
      onChange={(e) => setNewTransformerLatitude(e.target.value)}
    />

    <input
      type="number"
      step="any"
      placeholder="Longitude"
      value={newTransformerLongitude}
      onChange={(e) => setNewTransformerLongitude(e.target.value)}
    />
<button
  type="button"
  onClick={async () => {
  if (
    !newTransformerId ||
    !newTransformerLocation ||
    !newTransformerCapacity ||
    !newTransformerLatitude ||
    !newTransformerLongitude
  ) {
    alert('Please fill in all transformer fields')
    return
  }

  try {
      const response = await fetch(
       'https://gridpulse-v-backend.onrender.com/api/login' ,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: newTransformerId,
            location: newTransformerLocation,
            capacity_kva: Number(newTransformerCapacity),
            status: newTransformerStatus,
            latitude: Number(newTransformerLatitude),
            longitude: Number(newTransformerLongitude)
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to add transformer')
        return
      }

      alert('Transformer added successfully')

      setShowAddTransformer(false)

      setNewTransformerId('')
      setNewTransformerLocation('')
      setNewTransformerCapacity('')
      setNewTransformerStatus('Healthy')
      setNewTransformerLatitude('')
      setNewTransformerLongitude('')

      const refreshResponse = await fetch(
        'https://gridpulse-v-backend.onrender.com/api/transformers'
      )

      const refreshedTransformers = await refreshResponse.json()

      setLiveTransformers(refreshedTransformers)
    } catch (error) {
      console.error('Add transformer error:', error)
      alert('Unable to connect to the GRIDPULSE-V server')
    }
  }}
>
  Save Transformer
</button>
    

    <button
      type="button"
      onClick={() => setShowAddTransformer(false)}
    >
      Cancel
    </button>
  </div>
)}{showEditTransformer && editTransformer && (
  <div className="card">
    <h3>Edit Transformer</h3>

    <p>
      Editing Transformer: <strong>{editTransformer.id}</strong>
    </p>

    <input
      type="text"
      placeholder="Location"
      value={editTransformer.location}
      onChange={(e) =>
        setEditTransformer({
          ...editTransformer,
          location: e.target.value
        })
      }
    />

    <input
      type="number"
      placeholder="Capacity (kVA)"
      value={editTransformer.capacity_kva}
      onChange={(e) =>
        setEditTransformer({
          ...editTransformer,
          capacity_kva: e.target.value
        })
      }
    />

    <select
      value={editTransformer.status}
      onChange={(e) =>
        setEditTransformer({
          ...editTransformer,
          status: e.target.value
        })
      }
    >
      <option value="Healthy">Healthy</option>
      <option value="Warning">Warning</option>
      <option value="Critical">Critical</option>
    </select>

    <input
      type="number"
      step="any"
      placeholder="Latitude"
      value={editTransformer.latitude}
      onChange={(e) =>
        setEditTransformer({
          ...editTransformer,
          latitude: e.target.value
        })
      }
    />

    <input
      type="number"
      step="any"
      placeholder="Longitude"
      value={editTransformer.longitude}
      onChange={(e) =>
        setEditTransformer({
          ...editTransformer,
          longitude: e.target.value
        })
      }
    />

   <button
  type="button"
  onClick={async () => {
    try {
      const response = await fetch(
        `https://gridpulse-v-backend.onrender.com/api/transformers/${editTransformer.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            location: editTransformer.location,
            capacity_kva: Number(editTransformer.capacity_kva),
            status: editTransformer.status,
            latitude: Number(editTransformer.latitude),
            longitude: Number(editTransformer.longitude)
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to update transformer')
        return
      }

      alert('Transformer updated successfully')

      setShowEditTransformer(false)
      setEditTransformer(null)

      const refreshResponse = await fetch(
        'https://gridpulse-v-backend.onrender.com/api/transformers'
      )

      const refreshedTransformers =
        await refreshResponse.json()

      setLiveTransformers(refreshedTransformers)
    } catch (error) {
      console.error('Update transformer error:', error)
      alert('Unable to connect to the GRIDPULSE-V server')
    }
  }}
>
  Update Transformer
</button>
    <button
      type="button"
      onClick={() => {
        setShowEditTransformer(false)
        setEditTransformer(null)
      }}
    >
      Cancel
    </button>
  </div>
)}
              <input
                type="text"
                placeholder="Search transformers..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>

              <div className="card">

                <h3>Transformer List</h3>

                <table>

                  <thead>
                    <tr>
                      <th>Transformer ID</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {liveTransformers
                      .filter((transformer) => {

                        const matchesSearch =
                          transformer.id
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||

                          transformer.location
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||

                          transformer.capacity
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||

                          transformer.status
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())

                        const matchesStatus =
                          statusFilter === 'All' ||
                          transformer.status === statusFilter

                        return matchesSearch && matchesStatus
                      })

                      .map((transformer) => (

                        <tr key={transformer.id}>

                          <td>

                            <button
                              className="transformer-id-button"
                              onClick={() => {
                                setSelectedTransformer(transformer)
                                setActivePage('TransformerDetail')
                              }}
                            >
                              {transformer.id}
                            </button>

                          </td>

                          <td>
                            {transformer.location}
                          </td>

                          <td>
                            {transformer.capacity}
                          </td>

                          <td>

                            <span
                              className={`status-badge ${transformer.status.toLowerCase()}`}
                            >
                              {transformer.status}
                            </span>

                          </td>

                          <td>

                            <button
                              className="view-details-button"
                              onClick={() => {
                                setSelectedTransformer(transformer)
                                setActivePage('TransformerDetail')
                              }}
                            >
                              View Details
                            </button>
                           <button
  type="button"
  onClick={() => {
    setEditTransformer({
      ...transformer,
      capacity_kva: parseInt(
        transformer.capacity.replace(' kVA', ''),
        10
      )
    })

    setShowEditTransformer(true)
  }}
>
  Edit
</button>
<button
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete transformer ${transformer.id}?`
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
       `https://gridpulse-v-backend.onrender.com/api/transformers/${transformer.id}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to delete transformer')
        return
      }

      alert('Transformer deleted successfully')

      const refreshResponse = await fetch(
        'http://localhost:5000/api/transformers'
      )

      const refreshedTransformers =
        await refreshResponse.json()

      setLiveTransformers(refreshedTransformers)
    } catch (error) {
      console.error('Delete transformer error:', error)
      alert('Unable to connect to the GRIDPULSE-V server')
    }
  }}
>
  Delete
</button>
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>
            </>
          )}
{/* ================= ALERTS ================= */}

{activePage === 'Alerts' && (
  <>
    <h2>Alerts</h2>

    <p>
      Transformer alerts and condition notifications
    </p>

    <div className="cards">

      <div className="card">
        <h3>Active Alerts</h3>
       <strong>
  {alerts.filter((alert) => alert.status === 'Active').length}
</strong>
      </div>

      <div className="card">
        <h3>Critical</h3>
        <strong>
  {alerts.filter((alert) => alert.severity === 'Critical').length}
</strong>
      </div>

      <div className="card">
        <h3>Warnings</h3>
        <strong>
  {alerts.filter((alert) => alert.severity === 'Warning').length}
</strong>
      </div>

      <div className="card">
        <h3>Resolved Today</h3>
        <strong>
  {alerts.filter((alert) => alert.status === 'Resolved').length}
</strong>
      </div>

    </div>

    <div className="card">

      <h3>Recent Alerts</h3>

      <table>

        <thead>
          <tr>
            <th>Time</th>
            <th>Transformer</th>
            <th>Alert</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>
        </thead>
<tbody>
  {alerts.map((alert) => (
    <tr key={alert.id}>
      <td>
        {new Date(alert.alert_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>

      <td>
        <button
          className="transformer-id-button"
          onClick={() => {
            setSelectedTransformer(
              liveTransformers.find(
                (transformer) =>
                  transformer.id === alert.transformer_id
              )
            )
            setActivePage('TransformerDetail')
          }}
        >
          {alert.transformer_id}
        </button>
      </td>

      <td>{alert.alert_type}</td>

      <td>
        <span
          className={`status-badge ${alert.severity.toLowerCase()}`}
        >
          {alert.severity}
        </span>
      </td>

      <td>{alert.status}</td>
    </tr>
  ))}
</tbody>

      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>

      <p>
       DATA SOURCE — PostgreSQL alert records. 
      </p>

    </div>
  </>
)}{/* ================= DEVICES ================= */}

{activePage === 'Devices' && (
  <>
    <h2>Devices</h2>

    <p>
      GRIDPULSE-V monitoring devices and sensor communication
    </p>

    <div className="cards">

      <div className="card">
        <h3>Total Devices</h3>
      <strong>{devices.length}</strong>
      </div>

      <div className="card">
        <h3>Connected</h3>
        <strong>
  {devices.filter((device) => device.status === 'Connected').length}
</strong>
      </div>

      <div className="card">
  <h3>Warning</h3>
  <strong>
    {devices.filter((device) => device.status === 'Warning').length}
  </strong>
</div>

      

    </div>

    <div className="card">

      <h3>Device Inventory</h3>

      <table>

        <thead>
          <tr>
            <th>Device ID</th>
            <th>Transformer</th>
            <th>Device Type</th>
            <th>Status</th>
            <th>Last Communication</th>
          </tr>
        </thead>
        <tbody>
{devices.map((device) => (
  <tr key={device.device_id}>
    <td>{device.device_id}</td>
    <td>{device.transformer_id}</td>
    <td>{device.device_type}</td>

    <td>
      <span
        className={`status-badge ${
          device.status === 'Connected'
            ? 'healthy'
            : device.status === 'Warning'
            ? 'warning'
            : 'critical'
        }`}
      >
        {device.status}
      </span>
    </td>

    <td>
      {(() => {
        const seconds = Math.floor(
          (Date.now() -
            new Date(device.last_communication).getTime()) /
            1000
        )

        if (seconds < 60) {
          return `${seconds} sec ago`
        }

        return `${Math.floor(seconds / 60)} min ago`
      })()}
    </td>
  </tr>
))}
      </tbody>  
      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>
      <p>
  Data Source: PostgreSQL device records
</p>
        

    </div>
  </>
)}{/* ================= FLEET / HQ ================= */}
{/* ================= FLEET / HQ ================= */}

{activePage === 'Fleet' && (
  <>
    <h2>Fleet / HQ</h2>

    <p>
      Centralized overview of the GRIDPULSE-V transformer fleet
    </p>

    <div className="cards">

      <div className="card">
        <h3>Total Transformers</h3>
        <strong>{liveTransformers.length}</strong>
      </div>

      <div className="card">
        <h3>Healthy</h3>
        <strong>
          {(Array.isArray(liveTransformers) ? liveTransformers : []).filter(
            (transformer) => transformer.status === 'Healthy'
          ).length}
        </strong>
      </div>

      <div className="card">
        <h3>Warnings</h3>
        <strong>
          {(Array.isArray(liveTransformers) ? liveTransformers : []).filter(
            (transformer) => transformer.status === 'Warning'
          ).length}
        </strong>
      </div>

      <div className="card">
        <h3>Critical</h3>
        <strong>
          {(Array.isArray(liveTransformers) ? liveTransformers : []).filter(
            (transformer) => transformer.status === 'Critical'
          ).length}
        </strong>
      </div>

    </div>

    <div className="card">

      <h3>Fleet Status</h3>

      <table>

        <thead>
          <tr>
            <th>Transformer</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {liveTransformers.map((transformer) => (
            <tr key={transformer.id}>

              <td>{transformer.id}</td>
              <td>{transformer.location}</td>
              <td>{transformer.capacity}</td>

              <td>
                <span
                  className={`status-badge ${transformer.status.toLowerCase()}`}
                >
                  {transformer.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>

    <div className="card">

      <h3>Transformer Fleet Map</h3>

      <MapContainer
        center={[12.97, 80.22]}
        zoom={10}
        style={{ height: '400px', width: '100%' }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {liveTransformers.map((transformer) => (
          <Marker
            key={transformer.id}
            position={[
              transformer.latitude,
              transformer.longitude
            ]}
          >
            <Popup>
              <strong>{transformer.id}</strong>
              <br />
              {transformer.location}
              <br />
              {transformer.capacity}
              <br />
              Status: {transformer.status}
              <br />
              📍 Coordinates: {transformer.latitude},{' '}
              {transformer.longitude}
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>

    <div className="card">

      <h3>Fleet Data Source</h3>

      <p>
  Data Source: PostgreSQL transformer records
</p>

    </div>
  </>
)}
{/* ================= SYSTEM HEALTH ================= */}

{activePage === 'SystemHealth' && 
  <>
    <h2>System Health</h2>
    <p>
      GRIDPULSE-V platform, device and communication health
    </p>

    <div className="cards">

      <div className="card">
        <h3>Platform Status</h3>
        <strong>Healthy</strong>
      </div>

      <div className="card">
        <h3>Device Connectivity</h3>
        <strong>
  {devices.length > 0
    ? Math.round(
        (devices.filter(
          (device) => device.status === 'Connected'
        ).length /
          devices.length) *
          100
      )
    : 0}
  %
</strong>
      </div>

      <div className="card">
        <h3>Sensor Communication</h3>
        <strong>96%</strong>
      </div>
<div className="card">
  <h3>Offline Devices</h3>
  <strong>
    {devices.filter(
      (device) => device.status === 'Offline'
    ).length}
  </strong>
</div>
      <div className="card">
        <h3>Database Status</h3>
        <strong>Healthy</strong>
      </div>

    </div>

    <div className="card">

      <h3>System Components</h3>

      <table>

        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td>Web Application</td>
            <td>
              <span className="status-badge healthy">
                Operational
              </span>
            </td>
            <td>GRIDPULSE-V dashboard running normally</td>
          </tr>

          <tr>
  <td>ESP32 Devices</td>

  <td>
    <span
      className={`status-badge ${
        devices.length > 0 &&
        devices.filter(
          (device) => device.status === 'Connected'
        ).length === devices.length
          ? 'healthy'
          : devices.filter(
              (device) => device.status === 'Connected'
            ).length === 0
          ? 'critical'
          : 'warning'
      }`}
    >
      {devices.length > 0 &&
      devices.filter(
        (device) => device.status === 'Connected'
      ).length === devices.length
        ? 'Operational'
        : devices.filter(
            (device) => device.status === 'Connected'
          ).length === 0
        ? 'Offline'
        : 'Warning'}
    </span>
  </td>

  <td>
    {devices.filter(
      (device) => device.status === 'Connected'
    ).length}{' '}
    of {devices.length} devices connected
  </td>
</tr>

          <tr>
            <td>Sensor Communication</td>
            <td>
              <span className="status-badge healthy">
                Operational
              </span>
            </td>
            <td>Temperature, vibration and electrical sensors</td>
          </tr>

          <tr>
            <td>Database</td>
            <td>
              <span className="status-badge healthy">
                Operational
              </span>
            </td>
            <td>Transformer and monitoring data storage</td>
          </tr>

          <tr>
            <td>AI / Edge AI</td>
            <td>
              <span className="status-badge warning">
                Not Deployed
              </span>
            </td>
            <td>AI/TinyML integration planned for future phase</td>
          </tr>

        </tbody>

      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>

     <p>
  Data Source: GRIDPULSE-V platform and PostgreSQL records
</p>

    </div>
  </>
}{/* ================= REPORTS ================= */}

{activePage === 'Reports' && (
  <>
    <h2>Reports</h2>

    <p>
      Transformer monitoring, maintenance and fleet reports
    </p>

    <div className="cards">
      <div className="card">
  <h3>Health Reports</h3>
  <strong>{liveTransformers.length}</strong>
</div>
      <div className="card">
        <h3>Alert Reports</h3>
      <strong>{alerts.length}</strong>
      </div>

      <div className="card">
        <h3>Maintenance Reports</h3>
        <strong>{maintenanceReports.length}</strong>
      </div>
<div className="card">
  <h3>Fleet Reports</h3>
  <strong>{liveTransformers.length}</strong>
</div>  

    </div>

    <div className="card">

      <h3>Available Reports</h3>

      <table>

        <thead>
          <tr>
            <th>Report</th>
            <th>Description</th>
            <th>Period</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
  <tbody>

  <tr>
    <td>Transformer Health Report</td>
    <td>Health index and risk summary</td>
    <td>September 2026</td>

    <td>
      <span className="status-badge healthy">
        Available
      </span>
    </td>

    <td>
      <button
        onClick={() => {
          setShowHealthReport(true)
        }}
      >
        View
      </button>
    </td>
  </tr>

  <tr>
    <td>Alert History Report</td>
    <td>Transformer alert and event history</td>
    <td>September 2026</td>

    <td>
      <span className="status-badge healthy">
        Available
      </span>
    </td>

    <td>
      <button
  onClick={() => {
    setShowAlertReport(true)
  }}
>
  View
</button>
    </td>
  </tr>
<tr>
  <td>Maintenance Report</td>
  <td>Maintenance activities and schedules</td>
  <td>2026</td>

  <td>
    <span className="status-badge healthy">
      Available
    </span>
  </td>

  <td>
    <button
      onClick={() => {
        setShowMaintenanceReport(true)
      }}
    >
      View
    </button>
  </td>
</tr>

  <tr>
    <td>Fleet Performance Report</td>
    <td>Overall transformer fleet condition</td>
    <td>September 2026</td>

    <td>
      <span className="status-badge healthy">
        Available
      </span>
    </td>
<td>
  <button
    onClick={() => {
      setShowFleetReport(true)
    }}
  >
    View
  </button>
</td>
    
  </tr>

</tbody>
      </table>

    </div>
{showHealthReport && (
  <div className="card">

    <h3>Transformer Health Report</h3>

    <p>
      Current transformer health information from GRIDPULSE-V.
    </p>

    <table>
      <thead>
        <tr>
          <th>Transformer</th>
          <th>Location</th>
          <th>Capacity</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {liveTransformers.map((transformer) => (
          <tr key={transformer.id}>
            <td>{transformer.id}</td>
            <td>{transformer.location}</td>
            <td>{transformer.capacity}</td>

            <td>
              <span
                className={`status-badge ${
                  transformer.status === 'Healthy'
                    ? 'healthy'
                    : transformer.status === 'Warning'
                    ? 'warning'
                    : 'critical'
                }`}
              >
                {transformer.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <p>
      <strong>Data Source:</strong> PostgreSQL transformer records
    </p>

    <button
      onClick={() => {
        setShowHealthReport(false)
      }}
    >
      Close Report
    </button>

  </div>
)}

{showAlertReport && (

  <div className="card">

    <h3>Alert History Report</h3>

    <p>
      Transformer alert and event history from GRIDPULSE-V.
    </p>

    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Transformer</th>
          <th>Alert</th>
          <th>Severity</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>

  {alerts.map((alert) => (
    <tr key={alert.id}>

      <td>
        {new Date(alert.alert_time).toLocaleString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }
        )}
      </td>

      <td>{alert.transformer_id}</td>

      <td>{alert.alert_type}</td>

      <td>
        <span
          className={`status-badge ${
            alert.severity === 'Critical'
              ? 'critical'
              : alert.severity === 'Warning'
              ? 'warning'
              : 'healthy'
          }`}
        >
          {alert.severity}
        </span>
      </td>

      <td>{alert.status}</td>

    </tr>
  ))}

</tbody>
    </table>

    <p>
     <strong>Data Source:</strong> PostgreSQL alert records 
    </p>
<button
      onClick={() => {
        setShowAlertReport(false)
      }}
    >
      Close Report
    </button>

  </div>
)}

{showMaintenanceReport && (
  <div className="card">

    <h3>Maintenance Report</h3>

    <p>
      Maintenance activities and schedules from GRIDPULSE-V.
    </p>

    <table>

      <thead>
        <tr>
          <th>Transformer</th>
          <th>Location</th>
          <th>Maintenance Type</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>

  {maintenanceReports.map((record) => {
    const transformer = liveTransformers.find(
      (item) => item.id === record.transformer_id
    )

    return (
      <tr key={record.id}>

        <td>{record.transformer_id}</td>

        <td>
          {transformer ? transformer.location : 'Unknown'}
        </td>

        <td>{record.maintenance_type}</td>

        <td>
          {new Date(record.maintenance_date).toLocaleDateString(
            'en-GB',
            {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }
          )}
        </td>

        <td>
          <span
            className={`status-badge ${
              record.status === 'Completed'
                ? 'healthy'
                : record.status === 'Pending'
                ? 'warning'
                : 'critical'
            }`}
          >
            {record.status}
          </span>
        </td>

      </tr>
    )
  })}

</tbody>

    </table>

    <p>
      <strong>Data Source:</strong> PostgreSQL maintenance records
    </p>

    <button
      onClick={() => {
        setShowMaintenanceReport(false)
      }}
    >
      Close Report
    </button>

  </div>
)}
{showFleetReport && (
  <div className="card">

    <h3>Fleet Performance Report</h3>

    <p>
      Overall transformer fleet condition from GRIDPULSE-V.
    </p>

    <table>

      <thead>
        <tr>
          <th>Transformer</th>
          <th>Location</th>
          <th>Capacity</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>

        {liveTransformers.map((transformer) => (
          <tr key={transformer.id}>

            <td>{transformer.id}</td>

            <td>{transformer.location}</td>

            <td>{transformer.capacity}</td>

            <td>
              <span
                className={`status-badge ${
                  transformer.status === 'Healthy'
                    ? 'healthy'
                    : transformer.status === 'Warning'
                    ? 'warning'
                    : 'critical'
                }`}
              >
                {transformer.status}
              </span>
            </td>

          </tr>
        ))}

      </tbody>

    </table>

    <p>
      <strong>Total Transformers:</strong>{' '}
      {liveTransformers.length}
    </p>

    <p>
      <strong>Data Source:</strong> PostgreSQL transformer records
    </p>

    <button
      onClick={() => {
        setShowFleetReport(false)
      }}
    >
      Close Report
    </button>

  </div>
)}
</>
)}

{/* ================= SETTINGS ================= */}
    
{activePage === 'Settings' && (
  <>
    <h2>Settings</h2>

    <p>
      GRIDPULSE-V system configuration and monitoring preferences
    </p>

    <div className="cards">

      <div className="card">
        <h3>System Mode</h3>
        <strong>PostgreSQL</strong>
      </div>

      <div className="card">
        <h3>Data Source</h3>
        <strong>PostgreSQL</strong>
      </div>

      <div className="card">
        <h3>Alerts</h3>
        <strong>{temperatureMonitoring || vibrationMonitoring ? 'Enabled' : 'Disabled'}</strong>
      </div>

      <div className="card">
        <h3>Notifications</h3>
        <strong>{alertNotifications ? 'Enabled' : 'Disabled'}</strong>
      </div>

    </div>

    <div className="card">

      <h3>Monitoring Configuration</h3>

      <table>

        <thead>
          <tr>
            <th>Setting</th>
            <th>Current Value</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>

          <tr>
  <td>Temperature Monitoring</td>

  <td>
    <button
      onClick={() => {
        setTemperatureMonitoring(!temperatureMonitoring)
      }}
    >
      {temperatureMonitoring ? 'Enabled' : 'Disabled'}
    </button>
  </td>

  <td>
    Monitor transformer temperature
  </td>
</tr>
 <tr>
  <td>Vibration Monitoring</td>

  <td>
    <button
      onClick={() => {
        setVibrationMonitoring(!vibrationMonitoring)
      }}
    >
      {vibrationMonitoring ? 'Enabled' : 'Disabled'}
    </button>
  </td>

  <td>
    Monitor transformer vibration
  </td>
</tr>
     <tr>
  <td>Alert Notifications</td>

  <td>
    <button
      onClick={() => {
        setAlertNotifications(!alertNotifications)
      }}
    >
      {alertNotifications ? 'Enabled' : 'Disabled'}
    </button>
  </td>

  <td>
    Display transformer condition alerts
  </td>
</tr>     
       <tr>
  <td>Automatic Data Refresh</td>

  <td>
    <button
      onClick={() => {
        setAutoRefresh(!autoRefresh)
      }}
    >
      {autoRefresh ? 'Enabled' : 'Disabled'}
    </button>
  </td>

  <td>
    Refresh monitoring information automatically
  </td>
</tr>   
<tr>
  <td>Temperature Warning Threshold</td>

  <td>
    <input
      type="number"
      value={temperatureThreshold}
      onChange={(event) => {
        setTemperatureThreshold(Number(event.target.value))
      }}
      style={{ width: '90px' }}
    />{' '}
    °C
  </td>

  <td>
    Temperature level used for warning detection
  </td>
</tr>
<tr>
  <td>Vibration Warning Threshold</td>

  <td>
    <input
      type="number"
      step="0.1"
      value={vibrationThreshold}
      onChange={(event) => {
        setVibrationThreshold(Number(event.target.value))
      }}
      style={{ width: '90px' }}
    />{' '}
    mm/s
  </td>

  <td>
    Vibration level used for warning detection
  </td>
</tr>
  
<tr>
  <td>Temperature Critical Threshold</td>

  <td>
    <input
      type="number"
      value={temperatureCriticalThreshold}
      onChange={(event) => {
        setTemperatureCriticalThreshold(Number(event.target.value))
      }}
      style={{ width: '90px' }}
    />{' '}
    °C
  </td>

  <td>
    Temperature level used for critical condition detection
  </td>
</tr>

<tr>
  <td>Vibration Critical Threshold</td>

  <td>
    <input
      type="number"
      step="0.1"
      value={vibrationCriticalThreshold}
      onChange={(event) => {
        setVibrationCriticalThreshold(Number(event.target.value))
      }}
      style={{ width: '90px' }}
    />{' '}
    mm/s
  </td>

  <td>
    Vibration level used for critical condition detection
  </td>
</tr>
             </tbody>
</table>

</div>

<div className="card">

  <h3>Data Source</h3>

 <p>
  Settings are applied to the current monitoring session.
</p> 
</div>

</>

)}

{/* ================= TRANSFORMER DETAIL ================= */}
      

          {activePage === 'TransformerDetail' && selectedTransformer &&  (
            <>

              <h2>
                Transformer Overview
              </h2>

              <p>
                Detailed information for {selectedTransformer.id}
              </p>

              {/* DETAIL TABS */}

              <div className="detail-tabs">

                <button
                  onClick={() => setDetailTab('Overview')}
                >
                  Overview
                </button>

                <button
                  onClick={() => setDetailTab('Live Monitoring')}
                >
                  Live Monitoring
                </button>

                <button
                  onClick={() => setDetailTab('Trends & History')}
                >
                  Trends & History
                </button>

                <button
                  onClick={() => setDetailTab('Events')}
                >
                  Events
                </button>

                <button
                  onClick={() => setDetailTab('AI Analysis')}
                >
                  AI Analysis
                </button>

                <button
                  onClick={() => setDetailTab('Health Passport')}
                >
                  Health Passport
                </button>

                <button
                  onClick={() => setDetailTab('Maintenance')}
                >
                  Maintenance
                </button>

                <button
                  onClick={() => setDetailTab('Before / After')}
                >
                Before / After
                </button>
                <button
             onClick={() => setDetailTab('QR Profile')}
                >
           QR Profile
           </button>
           </div>

              {/* ================= OVERVIEW ================= */}

              {detailTab === 'Overview' && (
                <>

                  <div className="cards">

                    <div className="card">
                      <h3>Transformer ID</h3>
                      <strong>
                        {selectedTransformer.id}
                      </strong>
                    </div>

                    <div className="card">
                      <h3>Location</h3>
                      <strong>
                        {selectedTransformer.location}
                      </strong>
                    </div>

                    <div className="card">
                      <h3>Capacity</h3>
                      <strong>
                        {selectedTransformer.capacity}
                      </strong>
                    </div>

                    <div className="card">
                      <h3>Status</h3>
                      <strong>
                        {selectedTransformer.status}
                      </strong>
                    </div>

                  </div>

                  <div className="card">

                    <h3>Device Connection</h3>

                    <p>
                      Demo device status: Connected
                    </p>

                  </div>

                  {detailTab === 'Overview' && (
                <>
                
<div className="card">

  <h3>Health / Risk Index</h3>

  {latestSensorReading ? (
    <>
      <p>
        Health Score: <strong>{healthScore} / 100</strong>
      </p>

      <p>
        Risk Level: <strong>{healthRiskLevel}</strong>
      </p>

      <p>
        Temperature: {currentTemperature} °C
      </p>

      <p>
        Vibration: {currentVibration} mm/s
      </p>

      <p>
        Anomaly Detected:{' '}
        <strong>{anomalyDetected ? 'Yes' : 'No'}</strong>
      </p>
    </>
  ) : (
    <p>No sensor data available.</p>
  )}

  <p>DEMO RULE-BASED ANALYSIS — not real AI.</p>

</div>
                  

                </>
              )}

                </>
              )}

              {/* ================= LIVE MONITORING ================= */}

              {detailTab === 'Live Monitoring' && (
                <>

                  <h3>Live Monitoring</h3>

                  <p>
                    Real-time transformer condition monitoring
                  </p>
                  <div className="card">
                  <div className="card">
  <h3>Oil Temperature</h3>

  <strong>
    {currentTemperature !== null
      ? `${currentTemperature.toFixed(2)} °C`
      : 'No data'}
  </strong>

  <p>
    {temperatureMonitoring
      ? currentTemperature !== null
        ? `Backend data • ${
            currentTemperature > temperatureCriticalThreshold
              ? 'Critical'
              : currentTemperature > temperatureThreshold
              ? 'Warning'
              : 'Normal'
          }`
        : 'Backend data • No data'
      : 'Monitoring Disabled'}
  </p>
</div>
                    {temperatureMonitoring &&
  alertNotifications &&
  sensorReadings.length > 0 &&
  Number(sensorReadings[0].temperature_c) > temperatureThreshold && (
                  <div className="card">
                  <h3> Temperature Alert</h3>
                  <p>
                     Oil temperature is above the configured warning threshold.
                   </p>
                 <strong>
  {Number(sensorReadings[0].temperature_c)} °C &gt; {temperatureThreshold} °C
</strong>
                    </div>
                          )}{temperatureMonitoring &&
  alertNotifications &&
 sensorReadings.length > 0 &&
Number(sensorReadings[0].temperature_c) > temperatureCriticalThreshold && (
  <div className="card">
    <h3>🚨 Critical Temperature Alert</h3>
    <p>
      Oil temperature is above the configured critical threshold.
    </p>
    <strong>
  {Number(sensorReadings[0].temperature_c)} °C &gt; {temperatureCriticalThreshold} °C
</strong>
  </div>
)}

                    <div className="card">
                      <h3>Vibration</h3>
                     <strong>
  {currentVibration !== null
    ? `${currentVibration.toFixed(2)} mm/s`
    : 'No data'}
</strong>
                  <p>
  {vibrationMonitoring
    ? currentVibration !== null
      ? `Backend data • ${
          currentVibration > vibrationCriticalThreshold
            ? 'Critical'
            : currentVibration > vibrationThreshold
            ? 'Warning'
            : 'Normal'
        }`
      : 'Backend data • No data'
    : 'Monitoring Disabled'}
</p>
                    </div>
                   {vibrationMonitoring &&
  alertNotifications &&
 sensorReadings.length > 0 &&
Number(sensorReadings[0].vibration_mm_s) > vibrationThreshold && (
                <div className="card">
                   <h3> Vibration Alert</h3>
                        <p>
                   Vibration level is above the configured warning threshold.
                       </p>
                      <strong>
  {Number(sensorReadings[0].vibration_mm_s)} mm/s &gt; {vibrationThreshold} mm/s
</strong>
                      
                                </div>
                                )}
                         {vibrationMonitoring &&
  alertNotifications &&
  sensorReadings.length > 0 &&
  Number(sensorReadings[0].vibration_mm_s) > vibrationCriticalThreshold && (
    <div className="card">
      <h3>Critical Vibration Alert</h3>

      <p>
        Vibration level is above the configured critical threshold.
      </p>

      <strong>
        {Number(sensorReadings[0].vibration_mm_s)} mm/s &gt;{' '}
        {vibrationCriticalThreshold} mm/s
      </strong>
    </div>
  )}
                    <div className="card">
                      <h3>Voltage</h3>
                     <strong>
  {currentVoltage !== null
    ? `${currentVoltage.toFixed(2)} kV`
    : 'No data'}
</strong>
                     
                    <p>
  {currentVoltage !== null
    ? `Backend data • ${
        currentVoltage > voltageCriticalThreshold
          ? 'Critical'
          : currentVoltage > voltageThreshold
          ? 'Warning'
          : 'Normal'
      }`
    : 'Backend data • No data'}
</p> 
                    </div>

                    <div className="card">
                      <h3>Current</h3>
                      <strong>
  {currentCurrent !== null
    ? `${currentCurrent.toFixed(2)} A`
    : 'No data'}
</strong>
                      <p>
  {currentCurrent !== null
    ? `Backend data • ${
        currentCurrent > 30
          ? 'Critical'
          : currentCurrent > 25
          ? 'Warning'
          : 'Normal'
      }`
    : 'Backend data • No data'}
</p>
                    </div>

                    <div className="card">
                      <h3>Humidity</h3>
                     <strong>
  {currentHumidity !== null
    ? `${currentHumidity.toFixed(2)} %`
    : 'No data'}
</strong>
                      <p>
  {currentHumidity !== null
    ? 'Backend data • Normal'
    : 'Backend data • No data'}
</p>
                    </div>

                    <div className="card">
                      <h3>Acoustic Level</h3>
                      <strong>
  {currentAcoustic !== null
    ? `${currentAcoustic.toFixed(2)} dB`
    : 'No data'}
</strong>
                      <p>
  {currentAcoustic !== null
    ? 'Backend data • Normal'
    : 'Backend data • No data'}
</p>
                    </div>

                  </div>

                  <div className="card">

                    <h3>Monitoring Status</h3>

                    <p>
                      ● Device connected
                    </p>

                    <p>
                      ● Sensor communication normal
                    </p>
<p>
  ● Temperature Monitoring:{' '}
  {temperatureMonitoring ? 'Enabled' : 'Disabled'}
</p>

<p>
  ● Vibration Monitoring:{' '}
  {vibrationMonitoring ? 'Enabled' : 'Disabled'}
</p>
<p>
  ● Data source: ESP32 → PostgreSQL
</p>
                  </div>

                </>
              )}

              {/* ================= TRENDS & HISTORY ================= */}

              {detailTab === 'Trends & History' && (
  <>
    <h3>Trends & History</h3>

    <p>Transformer temperature and vibration history</p>

    <div className="detail-tabs">
      <button onClick={() => setHistoryRange('1H')}>1H</button>
      <button onClick={() => setHistoryRange('24H')}>24H</button>
      <button onClick={() => setHistoryRange('7D')}>7D</button>
      <button onClick={() => setHistoryRange('30D')}>30D</button>
    </div>

    <div className="card">
      <h3>Oil Temperature — {historyRange}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={filteredSensorReadings.map((reading) => ({
            time: new Date(reading.recorded_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            temperature: Number(reading.temperature_c)
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <p>Unit: °C</p>
    </div>

    <div className="card">
      <h3>Vibration History — {historyRange}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={filteredSensorReadings.map((reading) => ({
            time: new Date(reading.recorded_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            vibration: Number(reading.vibration_mm_s)
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="vibration"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <p>Unit: mm/s</p>
    </div>

    <div className="card">
      <h3>Data Source</h3>

      <p>Data Source: PostgreSQL sensor records</p>
    </div>
  </>
)}

              {/* ================= EVENTS ================= */}

              {detailTab === 'Events' && (
                <>

                  <h3>Events</h3>

                  <p>
                    Transformer event history and activity log
                  </p>

                  <div className="card">

                    <h3>Recent Events</h3>

                    <table>

                      <thead>

                        <tr>
                          <th>Time</th>
                          <th>Event</th>
                          <th>Severity</th>
                          <th>Status</th>
                        </tr>

                      </thead>                 

                      <tbody>
{eventRecords.length > 0 ? (
  eventRecords.map((event) => (
    <tr key={event.id}>
      <td>
        {new Date(event.alert_time).toLocaleString()}
      </td>

      <td>
        {event.description || event.alert_type}
      </td>

      <td>
        {event.severity}
      </td>

      <td>
        {event.status}
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="4">
      No events available for this transformer.
    </td>
  </tr>
)}
                        
                      </tbody>

                    </table>

                  </div>

                  <div className="card">

                    <h3>Data Source</h3>

                    <p>
  PostgreSQL alert records — Backend data.
</p>

                  </div>

                </>
              )}

              {/* ================= AI ANALYSIS ================= */}
{detailTab === 'AI Analysis' && (
  <>
    <h3>AI Analysis</h3>

    <p>
      Transformer condition and risk assessment
    </p>

    <div className="card">
      <h3>Analysis Status</h3>

      <strong>{healthRiskLevel || 'Unknown'}</strong>

      <p>
        Rule-based condition assessment using PostgreSQL sensor readings
      </p>
    </div>

    <div className="card">
      <h3>Risk Assessment</h3>

      <p>
        <strong>Risk Level:</strong> {healthRiskLevel}
      </p>

      <p>
        <strong>Health Index:</strong> {healthScore.toFixed(1)} / 100
      </p>

      <p>
        <strong>Anomaly Detected:</strong>{' '}
        {anomalyDetected ? 'Yes' : 'No'}
      </p>
    </div>

    <div className="card">
      <h3>Analysis Explanation</h3>

      <p>
        The condition assessment is based on the latest sensor readings
        received from the transformer through ESP32 and stored in PostgreSQL.
      </p>

      <p>
        Temperature: {currentTemperature !== null
          ? `${currentTemperature.toFixed(2)} °C`
          : 'No data'}
      </p>

      <p>
        Vibration: {currentVibration !== null
          ? `${currentVibration.toFixed(2)} mm/s`
          : 'No data'}
      </p>

      <p>
        Voltage: {currentVoltage !== null
          ? `${currentVoltage.toFixed(2)} kV`
          : 'No data'}
      </p>

      <p>
        Current: {currentCurrent !== null
          ? `${currentCurrent.toFixed(2)} A`
          : 'No data'}
      </p>
    </div>

    <div className="card">
      <h3>Recommended Action</h3>

      <p>
        {healthRiskLevel === 'Critical'
          ? 'Immediate inspection and maintenance assessment recommended.'
          : healthRiskLevel === 'Warning'
          ? 'Continue close monitoring and schedule preventive inspection.'
          : 'Continue routine monitoring. No immediate maintenance action is indicated.'}
      </p>
    </div>

    <div className="card">
      <h3>Model Information</h3>

      <p>
        Analysis type: Rule-based condition assessment
      </p>

      <p>
        AI/TinyML model: Not deployed yet
      </p>

      <p>
        Data source: ESP32 → PostgreSQL sensor readings
      </p>
    </div>
  </>
)}
              
              {/* ================= HEALTH PASSPORT ================= */}

              {detailTab === 'Health Passport' && (
                <>

                  <h3>Digital Health Passport</h3>

                  <p>
                    Long-term transformer identity and health record
                  </p>

                  <div className="card">

                    <h3>Transformer Identity</h3>

                    <p>
                      <strong>Transformer ID:</strong>{' '}
                      {selectedTransformer.id}
                    </p>

                    <p>
                      <strong>Location:</strong>{' '}
                      {selectedTransformer.location}
                    </p>

                    <p>
                      <strong>Capacity:</strong>{' '}
                      {selectedTransformer.capacity}
                    </p>

                    <p>
                      <strong>Current Status:</strong>{' '}
                      {selectedTransformer.status}
                    </p>

                  </div>

                  <div className="card">

                    <h3>Health Summary</h3>

                    <p>
                     <strong>Health Index:</strong> {healthScore} / 100
                    </p>

                    <p>
                     <strong>Risk Level:</strong> {healthRiskLevel}
                    </p>

                    <p>
                      <strong>Last Assessment:</strong> Today
                    </p>

                   <p>
  <strong>Assessment Type:</strong>{' '}
  Rule-based condition assessment
</p>

                  </div>

                  <div className="card">

                    <h3>Maintenance Summary</h3>

                    <p>
                      <strong>Last Maintenance:</strong>{' '}
                      15 September 2026
                    </p>

                    <p>
                      <strong>Next Scheduled Maintenance:</strong>{' '}
                      15 December 2026
                    </p>

                    <p>
                      <strong>Maintenance Status:</strong>{' '}
                      Up to date
                    </p>

                  </div>

                  <div className="card">

                    <h3>Device Information</h3>

                   <p>
  <strong>Monitoring Device:</strong>{' '}
  GRIDPULSE-V Monitoring Device
</p>

                    <p>
                      <strong>Connection:</strong> Connected
                    </p>

                    <p>
  <strong>Data Source:</strong> ESP32 → PostgreSQL
</p>
                  </div>

                </>
              )}

              {/* ================= MAINTENANCE ================= */}

             {detailTab === 'Maintenance' && (
  <>
    <h3>Maintenance</h3>

    <p>
      Transformer maintenance records and service history
    </p>

    <div className="card">
      <h3>Maintenance Status</h3>

     <p>
  <strong>Current Status:</strong>{' '}
  {maintenanceRecords.length > 0
    ? maintenanceRecords
        .slice()
        .sort(
          (a, b) =>
            new Date(b.maintenance_date) -
            new Date(a.maintenance_date)
        )[0].status || 'Available'
    : 'No maintenance records available'}
</p>

      <p>
        <strong>Last Maintenance:</strong>{' '}
        {maintenanceRecords.length > 0
          ? new Date(
              [...maintenanceRecords].sort(
                (a, b) =>
                  new Date(b.maintenance_date) -
                  new Date(a.maintenance_date)
              )[0].maintenance_date
            ).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : 'No record'}
      </p>

      <p>
        <strong>Next Scheduled Maintenance:</strong>{' '}
        15 December 2026
      </p>
    </div>

    <div className="card">
      <h3>Maintenance History</h3>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Maintenance Type</th>
            <th>Work Performed</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {maintenanceRecords.length > 0 ? (
            maintenanceRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  {record.maintenance_date
                    ? new Date(
                        record.maintenance_date
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '—'}
                </td>

                <td>
                  {record.maintenance_type || '—'}
                </td>

                <td>
                  {record.work_performed || '—'}
                </td>

                <td>
                  {record.status || '—'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">
                No maintenance records available for this transformer.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="card">
      <h3>Recommended Action</h3>

      <p>
        Continue routine monitoring and perform the next scheduled
        maintenance according to the maintenance plan.
      </p>

      <p>
        <strong>Data Source:</strong>{' '}
        PostgreSQL maintenance records
      </p>

      <p>
        <strong>Transformer:</strong>{' '}
        {selectedTransformer.id}
      </p>
    </div>
  </>
)}
              {/* ================= BEFORE / AFTER ================= */}
{detailTab === 'Before / After' && (
  <>
    <h3>Before / After Maintenance</h3>

    <p>
      Transformer condition comparison before and after maintenance
    </p>

    <div className="cards">

      <div className="card">

        <h3>Before Maintenance</h3>

        <p>
          <strong>Health Index:</strong> No record available
        </p>

        <p>
          <strong>Risk Level:</strong> No maintenance record
        </p>

        <p>
          <strong>Temperature:</strong> No maintenance baseline
        </p>

        <p>
          <strong>Vibration:</strong> No maintenance baseline
        </p>

        <p>
          <strong>Voltage:</strong> No maintenance baseline
        </p>

        <p>
          <strong>Current:</strong> No maintenance baseline
        </p>

        <p>
          <strong>Acoustic Level:</strong> No maintenance baseline
        </p>

      </div>


      <div className="card">

        <h3>After Maintenance</h3>

        {maintenanceRecords.length > 0 && latestSensorReading ? (
          <>

            <p>
              <strong>Health Index:</strong>{' '}
              {healthScore} / 100
            </p>

            <p>
              <strong>Risk Level:</strong>{' '}
              {healthRiskLevel}
            </p>

            <p>
              <strong>Temperature:</strong>{' '}
              {currentTemperature !== null
                ? `${currentTemperature} °C`
                : 'No data'}
            </p>

            <p>
              <strong>Vibration:</strong>{' '}
              {currentVibration !== null
                ? `${currentVibration} mm/s`
                : 'No data'}
            </p>

            <p>
              <strong>Voltage:</strong>{' '}
              {currentVoltage !== null
                ? `${currentVoltage} kV`
                : 'No data'}
            </p>

            <p>
              <strong>Current:</strong>{' '}
              {currentCurrent !== null
                ? `${currentCurrent} A`
                : 'No data'}
            </p>

            <p>
              <strong>Acoustic Level:</strong>{' '}
              {currentAcoustic !== null
                ? `${currentAcoustic} dB`
                : 'No data'}
            </p>

          </>
        ) : (

          <>
            <p>
              <strong>Status:</strong> No maintenance completed
            </p>

            <p>
              No post-maintenance condition is available because
              no maintenance record has been registered for this
              transformer.
            </p>

            <p>
              Current sensor readings are available in the
              Live Monitoring and Trends &amp; History sections.
            </p>
          </>

        )}

      </div>

    </div>


    <div className="card">

      <h3>Maintenance Impact</h3>

      {maintenanceRecords.length > 0 ? (

        <>
          <p>
            Maintenance records are available for this transformer.
            Post-maintenance sensor readings can be compared with
            the recorded pre-maintenance condition when baseline
            data is available.
          </p>

          <p>
            <strong>Current Health Index:</strong>{' '}
            {healthScore} / 100
          </p>

          <p>
            <strong>Current Risk Level:</strong>{' '}
            {healthRiskLevel}
          </p>
        </>

      ) : (

        <p>
          No maintenance impact can be calculated yet. Add a
          maintenance record and capture sensor readings before
          and after the service to enable a genuine comparison.
        </p>

      )}

      <p>
        <strong>Data Source:</strong>{' '}
        PostgreSQL maintenance records and sensor readings
      </p>

    </div>

  </>
)}
             
              {/* ================= QR PROFILE ================= */}

{detailTab === 'QR Profile' && (
  <>
    <h3>QR Profile</h3>

    <p>
      Digital identification profile for this transformer
    </p>

    <div className="card">

      <h3>Transformer Identity</h3>

      <p>
        <strong>Transformer ID:</strong>{' '}
        {selectedTransformer?.id || '—'}
      </p>

      <p>
        <strong>Location:</strong>{' '}
        {selectedTransformer?.location || '—'}
      </p>

      <p>
        <strong>Capacity:</strong>{' '}
        {selectedTransformer?.capacity ||
          (selectedTransformer?.capacity_kva
            ? `${selectedTransformer.capacity_kva} kVA`
            : '—')}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {selectedTransformer?.status || '—'}
      </p>

    </div>

    <div className="card">

      <h3>QR Profile Information</h3>

      <p>
        <strong>QR Code ID:</strong>{' '}
        {selectedTransformer?.id || '—'}
      </p>

      <p>
        Scan this QR code to quickly identify and open the
        digital monitoring profile for this transformer.
      </p>

      <div className="qr-code-container">

        <QRCodeCanvas
  value={
    `${window.location.origin}/?transformer=` +
    encodeURIComponent(selectedTransformer?.id || '')
  }
          size={200}
        />

      </div>

      <p>
        The QR code contains the transformer profile URL and
        can be placed on the physical transformer or monitoring
        enclosure.
      </p>

      <p>
        <strong>Status:</strong> QR code generated
      </p>

    </div>

    <div className="card">

      <h3>QR Usage</h3>

      <p>
        Scan the QR code using a mobile phone to identify this
        transformer and access its digital monitoring profile.
      </p>

      <p>
        <strong>Transformer:</strong>{' '}
        {selectedTransformer?.id || '—'}
      </p>

      <p>
        <strong>Profile Type:</strong> Digital Transformer Profile
      </p>

    </div>

    <div className="card">

      <h3>Data Source</h3>

      <p>
        PostgreSQL transformer records
      </p>

    </div>
  </>
)}

  </>
)}

      </main>
  
    </div>
  </div>
  )
}
)}
export default App
    