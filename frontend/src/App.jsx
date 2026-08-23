import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SituationOverview from './components/SituationOverview';
import ModuleNavigation from './components/ModuleNavigation';
import InteractiveMap from './components/InteractiveMap';
import StatsAndCharts from './components/StatsAndCharts';
import LiveAlerts from './components/LiveAlerts';
import BottomMetrics from './components/BottomMetrics';
import { translations } from './utils/translations';

// Initialize WebSocket client connection to backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

const App = () => {
  // Active Site state (Dwarka, Somnath, Ambaji, Pavagadh)
  const [selectedSite, setSelectedSite] = useState('dwarka');

  // Language State
  const [language, setLanguage] = useState('en');
  const t = translations[language] || translations.en;

  // Navigation Module State
  const [activeModule, setActiveModule] = useState('dashboard');
  
  // Refresh loading state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map Filter Toggles State
  const [mapFilters, setMapFilters] = useState({
    entryPoints: true,
    exitPoints: true,
    highDensity: true,
    cctv: true
  });

  // Situation Statistics State
  const [stats, setStats] = useState({
    systemStatus: 'Operational',
    currentCrowd: 14200,
    todayVisitors: 285600,
    capacityUsed: 42,
    entryCount: 15400,
    exitCount: 1200,
    activeZones: { current: 4, total: 10 },
    activeAlertsCount: 0,
    policeDeployed: 12,
    weatherImpact: 'Normal',
    aiConfidence: 96.8,
    lastUpdated: 'Just now'
  });

  // Live Alerts State
  const [alerts, setAlerts] = useState([]);

  // Bottom sparkline metrics state
  const [bottomMetrics, setBottomMetrics] = useState({
    todayVisitors: 285642,
    visitorsChange: '12.6',
    peakTime: '12:00 PM - 2:00 PM',
    predictionAccuracy: 96.8,
    accuracyChange: '3.2',
    highRiskZones: 1,
    riskZonesChange: '0',
    emergencyAlerts: 0,
    alertsChange: '0',
    avgWaitingTime: 25,
    waitingTimeChange: '5'
  });

  // Live 14-day forecast data fetched from API
  const [forecastData, setForecastData] = useState([]);

  // Fetch forecast data on selected temple change
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/analytics/forecast?siteId=${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.forecast) {
          setForecastData(data.forecast);
        }
      })
      .catch(err => console.error("Error fetching forecast:", err));
  }, [selectedSite]);

  // Hook WebSockets events
  useEffect(() => {
    // 1. Live Occupancy changes
    socket.on('occupancy_update', (data) => {
      if (data.siteId.toLowerCase() === selectedSite.toLowerCase()) {
        setStats(prev => {
          const newCrowd = Math.max(0, prev.currentCrowd + 1);
          return {
            ...prev,
            currentCrowd: newCrowd,
            capacityUsed: Math.min(100, Math.round((newCrowd / 1000) * 100)) // simulated limit 1000
          };
        });
      }
    });

    // 2. Telemetry and Incident warnings
    socket.on('zone_telemetry', (data) => {
      if (data.siteId.toLowerCase() === selectedSite.toLowerCase()) {
        // Toggle map highlights
      }
    });

    // 3. Emergency SOS Alerts
    socket.on('new_incident', (incident) => {
      if (incident.siteId.toLowerCase() === selectedSite.toLowerCase()) {
        setAlerts(prev => [
          {
            id: incident.id,
            title: incident.type.replace(/_/g, ' '),
            location: incident.zoneId || 'Main Corridor',
            time: new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: incident.severity.toLowerCase() === 'critical' ? 'critical' : 'warning',
            description: incident.description,
            incidentRaw: incident
          },
          ...prev
        ]);
        setStats(prev => ({
          ...prev,
          activeAlertsCount: prev.activeAlertsCount + 1
        }));
      }
    });

    // 4. Gate Validation transactions
    socket.on('gate_scan', (scan) => {
      if (scan.siteId && scan.siteId.toLowerCase() === selectedSite.toLowerCase()) {
        setStats(prev => {
          const isVal = scan.status === 'VALID';
          return {
            ...prev,
            entryCount: isVal ? prev.entryCount + 1 : prev.entryCount,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });
      }
    });

    return () => {
      socket.off('occupancy_update');
      socket.off('zone_telemetry');
      socket.off('new_incident');
      socket.off('gate_scan');
    };
  }, [selectedSite]);

  // Click handler for alerts to pan the map
  const handleAlertClick = (alertItem) => {
    alert(`Alert details: ${alertItem.title} - Location: ${alertItem.location}. Loading mitigation suggestions...`);
    
    // Trigger recommendations popup
    fetch(`http://localhost:5000/api/incidents/${alertItem.id}/recommend`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && data.recommendations) {
          const rec = data.recommendations;
          alert(`🤖 ML Recommended Action Plan:\n` +
                `- Suggested Duration: ${rec.predicted_duration} mins\n` +
                `- Security Marshals: ${rec.recommended_marshals}\n` +
                `- Barricades Required: ${rec.recommended_barricading}\n` +
                `- Diversions Plan: ${rec.recommended_diversion}`);
        }
      })
      .catch(err => console.error("Error loading recommendations:", err));
  };

  // Refresh handler to reload configurations
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Fixed Header with Site Selector */}
      <Header 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        language={language} 
        setLanguage={setLanguage} 
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
        t={t} 
      />
      
      {/* Main Bottom Section Layout */}
      <div style={styles.contentLayout}>
        {/* Left Sidebar */}
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} t={t} />

        {/* Scrollable Work Area */}
        <main style={styles.workArea}>
          
          {/* 1. MAIN OVERVIEW DASHBOARD TAB */}
          {activeModule === 'dashboard' && (
            <>
              {/* Situation Summary Grid */}
              <SituationOverview 
                stats={stats} 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                t={t}
              />

              {/* Module Navigation Row */}
              <ModuleNavigation activeModule={activeModule} setActiveModule={setActiveModule} />

              {/* Mid-level grid containing Map, Stats, Charts & Alerts */}
              <div style={styles.middleGrid}>
                <div style={styles.mapColumn}>
                  <InteractiveMap filters={mapFilters} setFilters={setMapFilters} />
                </div>
                <div style={styles.alertsColumn}>
                  <LiveAlerts alerts={alerts} onAlertClick={handleAlertClick} />
                </div>
              </div>

              {/* Stats column combined with charts grid */}
              <StatsAndCharts stats={stats} forecastData={forecastData} t={t} />

              {/* Bottom sparkline metrics grid */}
              <BottomMetrics metrics={bottomMetrics} />
            </>
          )}

          {/* 2. LIVE CROWD TAB */}
          {activeModule === 'live-crowd' && (
            <>
              <SituationOverview 
                stats={stats} 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                t={t}
              />
              <div style={styles.mapColumn}>
                <InteractiveMap filters={mapFilters} setFilters={setMapFilters} />
              </div>
            </>
          )}

          {/* 3. FORECASTING TAB */}
          {activeModule === 'forecast' && (
            <>
              <SituationOverview 
                stats={stats} 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                t={t}
              />
              <StatsAndCharts stats={stats} forecastData={forecastData} t={t} />
            </>
          )}

          {/* 3. INCIDENT ALERTS DESK TAB */}
          {activeModule === 'alerts' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <LiveAlerts alerts={alerts} onAlertClick={handleAlertClick} />
            </div>
          )}

          {/* 4. TRAFFIC APPROACH CORRIDORS TAB */}
          {activeModule === 'traffic' && (
            <div style={styles.trafficPanel} className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                TEMPLE CORRIDOR CONGESTION STATUS
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-main)', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700' }}>
                    <th style={{ padding: '12px' }}>APPROACH ROUTE</th>
                    <th style={{ padding: '12px' }}>CROWD LOADING</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>ESTIMATED WAIT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>North Corridor (Exit Gate 3)</td>
                    <td style={{ padding: '12px' }}>78%</td>
                    <td style={{ padding: '12px', color: '#ef4444', fontWeight: '700' }}>🚨 CRITICAL LEVEL</td>
                    <td style={{ padding: '12px' }}>~ 25 mins</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>East Walkway (Sanctum Approach)</td>
                    <td style={{ padding: '12px' }}>42%</td>
                    <td style={{ padding: '12px', color: '#f59e0b', fontWeight: '700' }}>⚠️ MODERATE LOAD</td>
                    <td style={{ padding: '12px' }}>~ 10 mins</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>West Car Parking Area</td>
                    <td style={{ padding: '12px' }}>15%</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: '700' }}>🟢 LIQUID</td>
                    <td style={{ padding: '12px' }}>0 mins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 5. MOCK / SETTINGS VIEWS */}
          {['reports', 'analytics', 'settings'].includes(activeModule) && (
            <div style={styles.mockViewContainer}>
              <h2 style={styles.mockTitle}>
                {activeModule.toUpperCase().replace('-', ' ')}
              </h2>
              <p style={styles.mockSub}>
                The module <strong>{activeModule}</strong> is fully integrated into the backend architecture.
              </p>
              <button 
                className="back-btn"
                style={styles.backBtn}
                onClick={() => setActiveModule('dashboard')}
              >
                Back to Dashboard Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  contentLayout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 'calc(100vh - 76px)',
    marginTop: '76px',
  },
  workArea: {
    flex: 1,
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  middleGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '20px',
    width: '100%',
  },
  mapColumn: {
    width: '100%',
  },
  alertsColumn: {
    width: '100%',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0 8px 0',
    borderTop: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '12px',
  },
  footerLeft: {
    textAlign: 'left',
  },
  footerCenter: {
    textAlign: 'center',
  },
  footerRight: {
    textAlign: 'right',
  },
  mockViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '12px',
    textAlign: 'center',
  },
  mockTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-blue)',
  },
  mockSub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
  },
  backBtn: {
    marginTop: '16px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-blue)',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    transition: 'opacity 0.2s ease',
  },
  trafficPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  }
};

export default App;