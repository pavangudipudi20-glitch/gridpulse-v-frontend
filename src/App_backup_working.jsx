import { useState, useEffect } from 'react'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedTransformer, setSelectedTransformer] = useState(null)
  const [detailTab, setDetailTab] = useState('Overview')
  const [historyRange, setHistoryRange] = useState('24H')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [liveTransformers, setLiveTransformers] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/transformers')
      .then((response) => response.json())
      .then((data) => {
        console.log('Transformers received:', data)
        setLiveTransformers(data)
      })
      .catch((error) => {
        console.error('Failed to fetch transformers:', error)
      })
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
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button onClick={() => setIsLoggedIn(true)}>
          Login
        </button>

        <small>
          DEMO LOGIN — Authentication will be connected to the backend later.
        </small>
      </div>
    </div>
  )
}

return (
    <div className="app">
      {/* TOP HEADER */}
      <header className="topbar">
        <h1>GRIDPULSE-V</h1>
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
                <strong>{liveTransformers.filter(t => t.status === 'Healthy').length}</strong>  
                </div>

                <div className="card">
                  <h3>Warnings</h3>
                  <strong>{liveTransformers.filter(t => t.status === 'Warning').length}</strong>
                </div>

                <div className="card">
                  <h3>Critical</h3>
                  <strong>{liveTransformers.filter(t => t.status === 'Critical').length}</strong>
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

      <tr>
        <td>10:42 AM</td>
        <td>TR-003</td>
        <td>Temperature increased</td>
        <td>
          <span className="status-badge warning">
            Warning
          </span>
        </td>
        <td>Active</td>
      </tr>

      <tr>
        <td>09:30 AM</td>
        <td>TR-004</td>
        <td>High transformer risk</td>
        <td>
          <span className="status-badge critical">
            Critical
          </span>
        </td>
        <td>Active</td>
      </tr>

      <tr>
        <td>08:15 AM</td>
        <td>TR-003</td>
        <td>Vibration level increased</td>
        <td>
          <span className="status-badge warning">
            Warning
          </span>
        </td>
        <td>Active</td>
      </tr>

    </tbody>

  </table>

  <p>
    DEMO DATA — alert records are simulated.
  </p>

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
        <strong>3</strong>
      </div>

      <div className="card">
        <h3>Critical</h3>
        <strong>1</strong>
      </div>

      <div className="card">
        <h3>Warnings</h3>
        <strong>2</strong>
      </div>

      <div className="card">
        <h3>Resolved Today</h3>
        <strong>4</strong>
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

          <tr>
            <td>10:42 AM</td>

            <td>
              <button
                className="transformer-id-button"
                onClick={() => {
                 setSelectedTransformer(
  liveTransformers.find((transformer) => transformer.id === 'TR-003')
) 
                  setActivePage('TransformerDetail')
                }}
              >
                TR-003
              </button>
            </td>

            <td>Temperature increased</td>

            <td>
              <span className="status-badge warning">
                Warning
              </span>
            </td>

            <td>Active</td>
          </tr>

          <tr>
            <td>09:30 AM</td>

            <td>
              <button
                className="transformer-id-button"
                onClick={() => {
                 setSelectedTransformer(
  liveTransformers.find((transformer) => transformer.id === 'TR-004')
)
                  setActivePage('TransformerDetail')
                }}
              >
                TR-004
              </button>
            </td>

            <td>High transformer risk</td>

            <td>
              <span className="status-badge critical">
                Critical
              </span>
            </td>

            <td>Active</td>
          </tr>

          <tr>
            <td>08:15 AM</td>

            <td>
              <button
                className="transformer-id-button"
                onClick={() => {
                  setSelectedTransformer(
  liveTransformers.find((transformer) => transformer.id === 'TR-003')
)
                  setActivePage('TransformerDetail')
                }}
              >
                TR-003
              </button>
            </td>

            <td>Vibration level increased</td>

            <td>
              <span className="status-badge warning">
                Warning
              </span>
            </td>

            <td>Active</td>
          </tr>

        </tbody>

      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>

      <p>
        DEMO DATA — alert records are simulated.
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
      <strong>{liveTransformers.length}</strong>
      </div>

      <div className="card">
        <h3>Connected</h3>
        <strong>22</strong>
      </div>

      <div className="card">
        <h3>Warning</h3>
        <strong>1</strong>
      </div>

      <div className="card">
        <h3>Offline</h3>
        <strong>1</strong>
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

          <tr>
            <td>GPV-ESP32-001</td>
            <td>TR-001</td>
            <td>GRIDPULSE-V Edge Device</td>
            <td>
              <span className="status-badge healthy">
                Connected
              </span>
            </td>
            <td>2 min ago</td>
          </tr>

          <tr>
            <td>GPV-ESP32-002</td>
            <td>TR-002</td>
            <td>GRIDPULSE-V Edge Device</td>
            <td>
              <span className="status-badge healthy">
                Connected
              </span>
            </td>
            <td>1 min ago</td>
          </tr>

          <tr>
            <td>GPV-ESP32-003</td>
            <td>TR-003</td>
            <td>GRIDPULSE-V Edge Device</td>
            <td>
              <span className="status-badge warning">
                Warning
              </span>
            </td>
            <td>5 min ago</td>
          </tr>

          <tr>
            <td>GPV-ESP32-004</td>
            <td>TR-004</td>
            <td>GRIDPULSE-V Edge Device</td>
            <td>
              <span className="status-badge critical">
                Offline
              </span>
            </td>
            <td>18 min ago</td>
          </tr>

        </tbody>

      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>

      <p>
        DEMO DATA — device and communication records are simulated.
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
          {liveTransformers.filter(
            (transformer) => transformer.status === 'Healthy'
          ).length}
        </strong>
      </div>

      <div className="card">
        <h3>Warnings</h3>
        <strong>
          {liveTransformers.filter(
            (transformer) => transformer.status === 'Warning'
          ).length}
        </strong>
      </div>

      <div className="card">
        <h3>Critical</h3>
        <strong>
          {liveTransformers.filter(
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
        DEMO DATA — fleet information is simulated for the prototype.
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
        <strong>92%</strong>
      </div>

      <div className="card">
        <h3>Sensor Communication</h3>
        <strong>96%</strong>
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
              <span className="status-badge healthy">
                Operational
              </span>
            </td>
            <td>22 of 24 demo devices connected</td>
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
        DEMO DATA — system health values are simulated for the prototype.
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
        <strong>24</strong>
      </div>

      <div className="card">
        <h3>Alert Reports</h3>
        <strong>18</strong>
      </div>

      <div className="card">
        <h3>Maintenance Reports</h3>
        <strong>12</strong>
      </div>

      <div className="card">
        <h3>Fleet Reports</h3>
        <strong>6</strong>
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
          </tr>

        </tbody>

      </table>

    </div>

    <div className="card">

      <h3>Data Source</h3>

      <p>
        DEMO DATA — report information is simulated for the prototype.
      </p>

    </div>
  </>
)}{/* ================= SETTINGS ================= */}

{activePage === 'Settings' && (
  <>
    <h2>Settings</h2>

    <p>
      GRIDPULSE-V system configuration and monitoring preferences
    </p>

    <div className="cards">

      <div className="card">
        <h3>System Mode</h3>
        <strong>Demo</strong>
      </div>

      <div className="card">
        <h3>Data Source</h3>
        <strong>Demo</strong>
      </div>

      <div className="card">
        <h3>Alerts</h3>
        <strong>Enabled</strong>
      </div>

      <div className="card">
        <h3>Notifications</h3>
        <strong>Enabled</strong>
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
            <td>Enabled</td>
            <td>Monitor transformer temperature</td>
          </tr>

          <tr>
            <td>Vibration Monitoring</td>
            <td>Enabled</td>
            <td>Monitor transformer vibration</td>
          </tr>

          <tr>
            <td>Alert Notifications</td>
            <td>Enabled</td>
            <td>Display transformer condition alerts</td>
          </tr>

          <tr>
            <td>Automatic Data Refresh</td>
            <td>Enabled</td>
            <td>Refresh monitoring information automatically</td>
          </tr>

        </tbody>
</table>

</div>

<div className="card">

  <h3>Data Source</h3>

  <p>
    DEMO DATA — settings are currently demonstration values.
  </p>

</div>

</>

)}

{/* ================= TRANSFORMER DETAIL ================= */}
      

          {activePage === 'TransformerDetail' && selectedTransformer && (
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

                  <div className="card">

                    <h3>Health Status</h3>

                    <p>
                      Demo health status: Normal
                    </p>

                  </div>

                </>
              )}

              {/* ================= LIVE MONITORING ================= */}

              {detailTab === 'Live Monitoring' && (
                <>

                  <h3>Live Monitoring</h3>

                  <p>
                    Real-time transformer condition monitoring
                  </p>

                  <div className="cards">

                    <div className="card">
                      <h3>Oil Temperature</h3>
                      <strong>62 °C</strong>
                      <p>Demo value • Normal</p>
                    </div>

                    <div className="card">
                      <h3>Vibration</h3>
                      <strong>2.4 mm/s</strong>
                      <p>Demo value • Normal</p>
                    </div>

                    <div className="card">
                      <h3>Voltage</h3>
                      <strong>11.2 kV</strong>
                      <p>Demo value • Normal</p>
                    </div>

                    <div className="card">
                      <h3>Current</h3>
                      <strong>24 A</strong>
                      <p>Demo value • Normal</p>
                    </div>

                    <div className="card">
                      <h3>Humidity</h3>
                      <strong>48 %</strong>
                      <p>Demo value • Normal</p>
                    </div>

                    <div className="card">
                      <h3>Acoustic Level</h3>
                      <strong>54 dB</strong>
                      <p>Demo value • Normal</p>
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
                      ● Data source: DEMO DATA
                    </p>

                  </div>

                </>
              )}

              {/* ================= TRENDS & HISTORY ================= */}

              {detailTab === 'Trends & History' && (
                <>

                  <h3>Trends & History</h3>

                  <p>
                    Transformer temperature history
                  </p>

                  <div className="detail-tabs">

                    <button
                      onClick={() => setHistoryRange('1H')}
                    >
                      1H
                    </button>

                    <button
                      onClick={() => setHistoryRange('24H')}
                    >
                      24H
                    </button>

                    <button
                      onClick={() => setHistoryRange('7D')}
                    >
                      7D
                    </button>

                    <button
                      onClick={() => setHistoryRange('30D')}
                    >
                      30D
                    </button>

                  </div>

                  <div className="card">

                    <h3>
                      Oil Temperature — {historyRange}
                    </h3>

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <LineChart
                        data={[
                          {
                            time: '00:00',
                            temperature: 58
                          },
                          {
                            time: '04:00',
                            temperature: 59
                          },
                          {
                            time: '08:00',
                            temperature: 61
                          },
                          {
                            time: '12:00',
                            temperature: 64
                          },
                          {
                            time: '16:00',
                            temperature: 63
                          },
                          {
                            time: '20:00',
                            temperature: 61
                          },
                          {
                            time: '24:00',
                            temperature: 60
                          }
                        ]}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="time"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="temperature"
                          strokeWidth={2}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                  <div className="card">

                    <h3>Data Source</h3>

                    <p>
                      DEMO DATA — historical values are simulated.
                    </p>

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

                        <tr>
                          <td>10:42 AM</td>
                          <td>Temperature increased</td>
                          <td>Warning</td>
                          <td>Active</td>
                        </tr>

                        <tr>
                          <td>09:15 AM</td>
                          <td>
                            Sensor communication restored
                          </td>
                          <td>Info</td>
                          <td>Resolved</td>
                        </tr>

                        <tr>
                          <td>08:30 AM</td>
                          <td>
                            Routine monitoring started
                          </td>
                          <td>Info</td>
                          <td>Logged</td>
                        </tr>

                        <tr>
                          <td>
                            Yesterday, 06:20 PM
                          </td>
                          <td>
                            Vibration level changed
                          </td>
                          <td>Warning</td>
                          <td>Resolved</td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                  <div className="card">

                    <h3>Data Source</h3>

                    <p>
                      DEMO DATA — event records are simulated.
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

                    <strong>Normal</strong>

                    <p>
                      Demo rule-based analysis
                    </p>

                  </div>

                  <div className="card">

                    <h3>Risk Assessment</h3>

                    <p>
                      <strong>Risk Level:</strong> Low
                    </p>

                    <p>
                      <strong>Health Index:</strong> 92 / 100
                    </p>

                    <p>
                      <strong>Anomaly Detected:</strong> No
                    </p>

                  </div>

                  <div className="card">
                    <h3>Analysis Explanation</h3>

                    <p>
                      Current demo temperature, vibration,
                      voltage and current values are within
                      the configured demonstration limits.
                    </p>

                  </div>

                  <div className="card">

                    <h3>Recommended Action</h3>

                    <p>
                      Continue routine monitoring. No immediate
                      maintenance action is required based on
                      the demo data.
                    </p>

                  </div>

                  <div className="card">

                    <h3>Model Information</h3>

                    <p>
                      Analysis type: Rule-based demonstration
                    </p>

                    <p>
                      AI/TinyML model: Not deployed yet
                    </p>

                    <p>
                      Data source: DEMO DATA
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
                      <strong>Health Index:</strong> 92 / 100
                    </p>

                    <p>
                      <strong>Risk Level:</strong> Low
                    </p>

                    <p>
                      <strong>Last Assessment:</strong> Today
                    </p>

                    <p>
                      <strong>Assessment Type:</strong>{' '}
                      Demo rule-based assessment
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
                      GRIDPULSE-V Demo Device
                    </p>

                    <p>
                      <strong>Connection:</strong> Connected
                    </p>

                    <p>
                      <strong>Data Source:</strong> DEMO DATA
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
                      <strong>Current Status:</strong> Up to date
                    </p>

                    <p>
                      <strong>Last Maintenance:</strong>{' '}
                      15 September 2026
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

                        <tr>
                          <td>15 Sep 2026</td>
                          <td>Routine Inspection</td>
                          <td>
                            Sensor and transformer condition check
                          </td>
                          <td>Completed</td>
                        </tr>

                        <tr>
                          <td>20 Jun 2026</td>
                          <td>Preventive Maintenance</td>
                          <td>
                            General inspection and connection check
                          </td>
                          <td>Completed</td>
                        </tr>

                        <tr>
                          <td>18 Mar 2026</td>
                          <td>Routine Inspection</td>
                          <td>
                            External condition inspection
                          </td>
                          <td>Completed</td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                  <div className="card">

                    <h3>Recommended Action</h3>

                    <p>
                      Continue routine monitoring and perform the
                      next scheduled maintenance according to the
                      maintenance plan.
                    </p>

                    <p>
                      <strong>Data Source:</strong> DEMO DATA
                    </p>

                  </div>

                </>
              )}

              {/* ================= BEFORE / AFTER ================= */}

              {detailTab === 'Before / After' && (
                <>

                  <h3>Before / After Maintenance</h3>

                  <p>
                    Transformer condition comparison before and after
                    maintenance
                  </p>

                  <div className="cards">

                    <div className="card">

                      <h3>Before Maintenance</h3>

                      <p>
                        <strong>Health Index:</strong> 76 / 100
                      </p>

                      <p>
                        <strong>Risk Level:</strong> Medium
                      </p>

                      <p>
                        <strong>Temperature:</strong> 71 °C
                      </p>

                      <p>
                        <strong>Vibration:</strong> 3.8 mm/s
                      </p>

                    </div>

                    <div className="card">

                      <h3>After Maintenance</h3>

                      <p>
                        <strong>Health Index:</strong> 92 / 100
                      </p>

                      <p>
                        <strong>Risk Level:</strong> Low
                      </p>

                      <p>
                        <strong>Temperature:</strong> 62 °C
                      </p>

                      <p>
                        <strong>Vibration:</strong> 2.4 mm/s
                      </p>

                    </div>

                  </div>

                  <div className="card">

                    <h3>Maintenance Impact</h3>

                    <p>
                      Health Index improved from{' '}
                      <strong>76</strong> to{' '}
                      <strong>92</strong>.
                    </p>

                    <p>
                      Temperature reduced from{' '}
                      <strong>71 °C</strong> to{' '}
                      <strong>62 °C</strong>.
                    </p>

                    <p>
                      Vibration reduced from{' '}
                      <strong>3.8 mm/s</strong> to{' '}
                      <strong>2.4 mm/s</strong>.
                    </p>

                    <p>
                      <strong>Data Source:</strong> DEMO DATA
                    </p>

                  </div>

                </>
              )}

              {/* BACK BUTTON */}

              <button
                onClick={() => {
                  setActivePage('Transformers')
                  setSelectedTransformer(null)
                }}
              >
                ← Back to Transformers
              </button>

            </>
          )}

        </main>

      </div>

    </div>
  )
}


export default App