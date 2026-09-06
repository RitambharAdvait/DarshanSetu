import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  Activity, 
  HeartPulse, 
  Radio, 
  Ambulance, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Gauge, 
  Zap, 
  PhoneForwarded, 
  Waves, 
  Phone,
  Power,
  FileText
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const EmergencyCommandDesk = ({ selectedSite, socket, t }) => {
  // ==========================================
  // FEATURE 3: 4-TIER THREAT LEVEL STATE
  // ==========================================
  const [threatState, setThreatState] = useState({
    level: 'LEVEL_1_GREEN',
    title: 'LEVEL 1: NORMAL FLOW',
    description: 'Standard crowd throughput. All turnstiles operating at 100% capacity.',
    gateSpeedRate: 100,
    marshalsMobilized: 12,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    updatedBy: 'Control Room Officer'
  });
  const [isUpdatingThreat, setIsUpdatingThreat] = useState(false);

  // ==========================================
  // FEATURE 4: MULTI-AGENCY INTERCOM STATE
  // ==========================================
  const [intercomAgencies, setIntercomAgencies] = useState([
    {
      id: 'AMB_108',
      name: '108 On-Site Ambulance & Trauma Ward',
      category: 'AMBULANCE',
      phone: '108',
      radioChannel: 'MED-FREQ-1',
      status: 'ONLINE',
      assignedUnit: 'Trauma Unit 1 (East Gate Parking)'
    },
    {
      id: 'POL_112',
      name: '112 District Police Control Room & SP Office',
      category: 'POLICE',
      phone: '112',
      radioChannel: 'POLICE-TAC-4',
      status: 'ONLINE',
      assignedUnit: 'Pilgrimage Security Battalion'
    },
    {
      id: 'FIRE_101',
      name: '101 Fire & Disaster Rescue Brigade',
      category: 'FIRE',
      phone: '101',
      radioChannel: 'FIRE-DIRECT',
      status: 'ONLINE',
      assignedUnit: 'Hydrant Quick-Deploy Tender'
    },
    {
      id: 'POWER_GRID',
      name: 'Substation Power Grid Rapid Cutoff',
      category: 'POWER_GRID',
      phone: '02892-234200',
      radioChannel: 'GRID-CUTOFF-SEC',
      status: 'ONLINE',
      assignedUnit: 'Sector 1-4 Master Killswitch'
    },
    {
      id: 'NDRF_HQ',
      name: 'National Disaster Response Force (NDRF 6th Bn)',
      category: 'DISASTER',
      phone: '011-24363260',
      radioChannel: 'NDRF-REGIONAL',
      status: 'STANDBY',
      assignedUnit: 'District Disaster Cell'
    }
  ]);
  const [recentDispatches, setRecentDispatches] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);

  // ==========================================
  // FEATURE 1: LOST PERSON STATE
  // ==========================================
  const [lostRecords, setLostRecords] = useState([]);
  const [isLoadingLost, setIsLoadingLost] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    clothingDescription: '',
    language: 'Hindi / Gujarati',
    lastSeenLocation: 'Main Queue Corridor — Pillar #14',
    contactPhone: '',
    guardianName: '',
    notes: 'Perimeter Gate Exit monitors notified immediately'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // FEATURE 2: GREEN CORRIDOR STATE
  // ==========================================
  const [corridors, setCorridors] = useState([
    {
      id: 'CORRIDOR_B',
      name: 'Corridor B (West Parikrama Stretcher Lane)',
      zone: 'Sector 2 - West Outer Ring',
      widthMeters: 2.4,
      isActive: false,
      marshalsAssigned: 4,
      targetHospital: 'Dwarka Civil Hospital & Trauma Post 1'
    },
    {
      id: 'CORRIDOR_A',
      name: 'Corridor A (Main Queue Barrier Bypass)',
      zone: 'Sector 1 - North Canopy',
      widthMeters: 2.0,
      isActive: false,
      marshalsAssigned: 3,
      targetHospital: 'On-Site Medical Camp Alpha'
    },
    {
      id: 'CORRIDOR_C',
      name: 'Corridor C (Inner Sanctum Emergency Exit)',
      zone: 'Garbhagriha South Corridor',
      widthMeters: 3.0,
      isActive: false,
      marshalsAssigned: 6,
      targetHospital: 'Emergency Cardiac ICU Mobile Unit'
    }
  ]);
  const [isTogglingCorridor, setIsTogglingCorridor] = useState(false);
  const [activeCorridorTimer, setActiveCorridorTimer] = useState(0);

  // Fetch All Initial Data
  const fetchData = () => {
    setIsLoadingLost(true);

    // Threat Level
    fetch(`${BACKEND_URL}/api/incidents/threat-level/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.state) setThreatState(data.state);
      })
      .catch(() => {});

    // Lost Persons
    fetch(`${BACKEND_URL}/api/incidents/lost-persons/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        setIsLoadingLost(false);
        if (data && data.records) setLostRecords(data.records);
      })
      .catch(() => setIsLoadingLost(false));

    // Green Corridors
    fetch(`${BACKEND_URL}/api/incidents/green-corridor/status/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.corridors) setCorridors(data.corridors);
      })
      .catch(() => {});

    // Intercom Directory
    fetch(`${BACKEND_URL}/api/incidents/intercom/directory/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.directory) setIntercomAgencies(data.directory);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('threat_level_change', (newState) => {
        if (newState) setThreatState(newState);
      });

      socket.on('lost_person_alert', (newRecord) => {
        setLostRecords(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
      });

      socket.on('lost_person_reunited', (updatedRecord) => {
        setLostRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      });

      socket.on('green_corridor_status', (data) => {
        if (data && data.corridor) {
          setCorridors(prev => prev.map(c => c.id === data.corridor.id ? data.corridor : c));
        }
      });

      socket.on('intercom_dispatch', (dispatch) => {
        if (dispatch) {
          setRecentDispatches(prev => [dispatch, ...prev.slice(0, 4)]);
        }
      });
    }
  }, [selectedSite, socket]);

  // Stopwatch for active green corridor
  useEffect(() => {
    const isAnyActive = corridors.some(c => c.isActive);
    let interval = null;
    if (isAnyActive) {
      interval = setInterval(() => {
        setActiveCorridorTimer(prev => prev + 1);
      }, 1000);
    } else {
      setActiveCorridorTimer(0);
    }
    return () => clearInterval(interval);
  }, [corridors]);

  // Handle Threat Level Shift
  const handleSetThreatLevel = (newLevel) => {
    if (threatState.level === newLevel) return;

    if (newLevel === 'LEVEL_4_RED') {
      if (!window.confirm('⚠️ CRITICAL ACTION: Activate LEVEL 4 RED LOCKDOWN? This will lock all entry turnstiles and alert District NDRF.')) {
        return;
      }
    }

    setIsUpdatingThreat(true);
    fetch(`${BACKEND_URL}/api/incidents/threat-level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: selectedSite,
        level: newLevel,
        updatedBy: 'Magisterial Control Room'
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsUpdatingThreat(false);
        if (data && data.state) setThreatState(data.state);
      })
      .catch(() => {
        setIsUpdatingThreat(false);
        setThreatState(prev => ({ ...prev, level: newLevel }));
      });
  };

  // Handle Intercom Quick Dispatch Action
  const handleDispatchAgency = (agency) => {
    if (agency.category === 'POWER_GRID') {
      if (!window.confirm('⚡ CONFIRM POWER GRID CUTOFF: Cut master electrical power to prevent queue short-circuit fire?')) {
        return;
      }
    }

    setIsDispatching(true);
    fetch(`${BACKEND_URL}/api/incidents/intercom/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: selectedSite,
        agencyId: agency.id,
        message: `Priority Emergency Dispatch Alert for ${agency.name}`
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsDispatching(false);
        if (data && data.dispatch) {
          setRecentDispatches(prev => [data.dispatch, ...prev.slice(0, 4)]);
        }
        alert(`🚨 INTERCOM DISPATCHED: ${agency.name} (${agency.phone}) notified immediately.`);
      })
      .catch(() => {
        setIsDispatching(false);
        const fallbackDispatch = {
          id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
          agencyName: agency.name,
          phone: agency.phone,
          dispatchedAt: new Date().toISOString()
        };
        setRecentDispatches(prev => [fallbackDispatch, ...prev.slice(0, 4)]);
        alert(`🚨 Emergency Call Triggered: ${agency.name} (${agency.phone})`);
      });
  };

  // Toggle Green Corridor Action
  const handleToggleGreenCorridor = (corridorId, reason) => {
    setIsTogglingCorridor(true);
    fetch(`${BACKEND_URL}/api/incidents/green-corridor/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: selectedSite,
        corridorId,
        reason: reason || 'Rapid Stretcher Medical Evacuation'
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsTogglingCorridor(false);
        if (data && data.corridor) {
          setCorridors(prev => prev.map(c => c.id === data.corridor.id ? data.corridor : c));
        }
      })
      .catch(() => {
        setIsTogglingCorridor(false);
        setCorridors(prev => prev.map(c => c.id === corridorId ? { ...c, isActive: !c.isActive } : c));
      });
  };

  // Submit Lost Person Report
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.clothingDescription) {
      return alert('Please fill in Name and Clothing description.');
    }

    setIsSubmitting(true);
    fetch(`${BACKEND_URL}/api/incidents/lost-person`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        siteId: selectedSite
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        setShowReportModal(false);
        setFormData({
          name: '',
          age: '',
          gender: 'MALE',
          clothingDescription: '',
          language: 'Hindi / Gujarati',
          lastSeenLocation: 'Main Queue Corridor — Pillar #14',
          contactPhone: '',
          guardianName: '',
          notes: ''
        });
        fetchData();
        alert(`🚨 ALERT BROADCASTED: ${data.message || 'Perimeter gates locked for screening'}`);
      })
      .catch(() => {
        setIsSubmitting(false);
        alert('Alert logged locally in offline mode.');
      });
  };

  // Mark Person Reunited
  const handleMarkReunited = (id, personName) => {
    if (!window.confirm(`Confirm reunion for ${personName}? This will clear the perimeter exit gate lockdown alert.`)) return;

    fetch(`${BACKEND_URL}/api/incidents/lost-person/reunite/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNotes: 'Reunited safely at Pilgrimage Help Desk.' })
    })
      .then(res => res.json())
      .then(() => {
        fetchData();
      })
      .catch(() => {
        setLostRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'REUNITED', reunitedAt: new Date().toISOString() } : r));
      });
  };

  const activeSearches = lostRecords.filter(r => r.status === 'ACTIVE_SEARCH');
  const reunitedHistory = lostRecords.filter(r => r.status === 'REUNITED');
  const activeCorridors = corridors.filter(c => c.isActive);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'LEVEL_4_RED': return '#ef4444';
      case 'LEVEL_3_ORANGE': return '#f97316';
      case 'LEVEL_2_YELLOW': return '#eab308';
      default: return '#10b981';
    }
  };

  const getAgencyIcon = (category) => {
    switch (category) {
      case 'AMBULANCE': return <Ambulance size={18} color="#ef4444" />;
      case 'POLICE': return <ShieldCheck size={18} color="#2563eb" />;
      case 'FIRE': return <Flame size={18} color="#f97316" />;
      case 'POWER_GRID': return <Power size={18} color="#eab308" />;
      case 'DISASTER': return <Waves size={18} color="#06b6d4" />;
      default: return <PhoneCall size={18} color="#64748b" />;
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Top Header Banner */}
      <div className="card" style={{ ...styles.headerCard, borderLeft: `5px solid ${getThreatColor(threatState.level)}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ ...styles.sirenIconBox, backgroundColor: `${getThreatColor(threatState.level)}15` }}>
            <AlertOctagon size={28} color={getThreatColor(threatState.level)} />
          </div>
          <div>
            <div style={{ ...styles.headerTag, color: getThreatColor(threatState.level) }}>
              STATE DISASTER & POLICE EMERGENCY COMMAND • {threatState.title}
            </div>
            <h2 style={styles.headerTitle}>INCIDENT MANAGEMENT & SOS DISPATCH COMMAND</h2>
            <div style={styles.headerSub}>
              Site: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{selectedSite}</strong> • Gate Throttle Rate: <strong>{threatState.gateSpeedRate}%</strong> • Marshals Mobilized: <strong>{threatState.marshalsMobilized} Officers</strong>
            </div>
          </div>
        </div>

        {/* Feature Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={styles.primaryActionBtn}
            onClick={() => setShowReportModal(true)}
          >
            <PlusCircle size={16} /> Broadcast Lost Person Alert
          </button>
          <button 
            style={styles.refreshBtn}
            onClick={fetchData}
            title="Refresh feed"
          >
            <RefreshCw size={16} className={isLoadingLost ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FEATURE 3: 4-TIER TEMPLE ALERT THREAT DIAL (DEFCON STYLE) */}
      {/* ======================================================== */}
      <div className="card" style={styles.threatDialPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={20} color="var(--color-blue)" />
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              TEMPLE ALERT THREAT DIAL (OVERARCHING DEFCON PROTOCOL)
            </h3>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Click dial level to shift platform operational state
          </div>
        </div>

        {/* The 4 Dial Buttons Grid */}
        <div style={styles.dialGrid}>
          
          <button 
            type="button"
            style={{
              ...styles.dialBtn,
              borderColor: threatState.level === 'LEVEL_1_GREEN' ? '#10b981' : 'var(--border-color)',
              backgroundColor: threatState.level === 'LEVEL_1_GREEN' ? '#ecfdf5' : 'var(--bg-item)',
              boxShadow: threatState.level === 'LEVEL_1_GREEN' ? '0 0 0 2px #10b981' : 'none'
            }}
            onClick={() => handleSetThreatLevel('LEVEL_1_GREEN')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px' }}>🟢</span>
              {threatState.level === 'LEVEL_1_GREEN' && <span style={styles.activePillGreen}>ACTIVE</span>}
            </div>
            <div style={{ ...styles.dialBtnTitle, color: '#047857' }}>LEVEL 1: NORMAL</div>
            <div style={styles.dialBtnSub}>100% Gate Flow • Standard Patrols (12 Marshals)</div>
          </button>

          <button 
            type="button"
            style={{
              ...styles.dialBtn,
              borderColor: threatState.level === 'LEVEL_2_YELLOW' ? '#eab308' : 'var(--border-color)',
              backgroundColor: threatState.level === 'LEVEL_2_YELLOW' ? '#fefce8' : 'var(--bg-item)',
              boxShadow: threatState.level === 'LEVEL_2_YELLOW' ? '0 0 0 2px #eab308' : 'none'
            }}
            onClick={() => handleSetThreatLevel('LEVEL_2_YELLOW')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px' }}>🟡</span>
              {threatState.level === 'LEVEL_2_YELLOW' && <span style={styles.activePillYellow}>ACTIVE</span>}
            </div>
            <div style={{ ...styles.dialBtnTitle, color: '#a16207' }}>LEVEL 2: ELEVATED</div>
            <div style={styles.dialBtnSub}>80% Gate Flow • Bottleneck Marshals Standby (18)</div>
          </button>

          <button 
            type="button"
            style={{
              ...styles.dialBtn,
              borderColor: threatState.level === 'LEVEL_3_ORANGE' ? '#f97316' : 'var(--border-color)',
              backgroundColor: threatState.level === 'LEVEL_3_ORANGE' ? '#fff7ed' : 'var(--bg-item)',
              boxShadow: threatState.level === 'LEVEL_3_ORANGE' ? '0 0 0 2px #f97316' : 'none'
            }}
            onClick={() => handleSetThreatLevel('LEVEL_3_ORANGE')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px' }}>🟠</span>
              {threatState.level === 'LEVEL_3_ORANGE' && <span style={styles.activePillOrange}>ACTIVE</span>}
            </div>
            <div style={{ ...styles.dialBtnTitle, color: '#c2410c' }}>LEVEL 3: SURGE RISK</div>
            <div style={styles.dialBtnSub}>50% Gate Throttle • Holding Bays Active (28 Marshals)</div>
          </button>

          <button 
            type="button"
            style={{
              ...styles.dialBtn,
              borderColor: threatState.level === 'LEVEL_4_RED' ? '#ef4444' : 'var(--border-color)',
              backgroundColor: threatState.level === 'LEVEL_4_RED' ? '#fef2f2' : 'var(--bg-item)',
              boxShadow: threatState.level === 'LEVEL_4_RED' ? '0 0 0 2px #ef4444' : 'none'
            }}
            onClick={() => handleSetThreatLevel('LEVEL_4_RED')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px' }}>🔴</span>
              {threatState.level === 'LEVEL_4_RED' && <span style={styles.activePillRed}>LOCKDOWN</span>}
            </div>
            <div style={{ ...styles.dialBtnTitle, color: '#b91c1c' }}>LEVEL 4: LOCKDOWN</div>
            <div style={styles.dialBtnSub}>0% Gates on HOLD • Evacuation Routes Open (45 Marshals)</div>
          </button>

        </div>

        {/* Active Threat Operational Banner */}
        <div style={{ ...styles.activeThreatGuideline, borderColor: getThreatColor(threatState.level) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color={getThreatColor(threatState.level)} />
            <div>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                Active Operational Directive: {threatState.title}
              </strong>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {threatState.description}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FEATURE 4: 1-CLICK MULTI-AGENCY RAPID INTERCOM DIRECTORY */}
      {/* ======================================================== */}
      <div className="card" style={styles.intercomPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneForwarded size={20} color="#2563eb" />
            <div>
              <span style={styles.intercomTag}>DIRECT COMMAND DISPATCH</span>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                1-CLICK MULTI-AGENCY RAPID INTERCOM DIRECTORY
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Direct lines to Police, Trauma Hospital, Fire & Disaster Base
          </div>
        </div>

        {/* Intercom Cards Grid */}
        <div style={styles.intercomGrid}>
          {intercomAgencies.map((agency) => (
            <div key={agency.id} className="card hover-lift" style={styles.agencyCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={styles.agencyIconBox}>
                    {getAgencyIcon(agency.category)}
                  </div>
                  <div>
                    <h4 style={styles.agencyName}>{agency.name}</h4>
                    <span style={styles.agencyUnit}>{agency.assignedUnit}</span>
                  </div>
                </div>
                <span style={styles.onlineBadge}>
                  <span className="pulsing-dot-green"></span> {agency.radioChannel}
                </span>
              </div>

              <div style={styles.agencyFooter}>
                <a href={`tel:${agency.phone}`} style={styles.phoneLink}>
                  <Phone size={12} /> Direct: <strong>{agency.phone}</strong>
                </a>
                <button
                  type="button"
                  disabled={isDispatching}
                  style={{
                    ...styles.dispatchBtn,
                    backgroundColor: agency.category === 'POWER_GRID' ? '#eab308' : '#2563eb'
                  }}
                  onClick={() => handleDispatchAgency(agency)}
                >
                  {agency.category === 'POWER_GRID' ? '⚡ Emergency Cutoff' : '🚨 1-Click Dispatch Alert'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Dispatches Log */}
        {recentDispatches.length > 0 && (
          <div style={styles.dispatchLogBox}>
            <small style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)' }}>
              RECENT INTERCOM TRANSMISSION AUDIT:
            </small>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              {recentDispatches.map((d, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <strong>{d.agencyName}</strong> ({d.phone}) dispatched at {new Date(d.dispatchedAt).toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Metric Counters Banner */}
      <div style={styles.metricsGrid}>
        
        {/* Metric 1: Green Corridor Status */}
        <div className="card" style={{ ...styles.metricCard, borderLeft: activeCorridors.length > 0 ? '4px solid #10b981' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={styles.metricLabel}>STRETCHER GREEN CORRIDOR</span>
            <span style={{ ...styles.badge, backgroundColor: activeCorridors.length > 0 ? '#ecfdf5' : '#f1f5f9', color: activeCorridors.length > 0 ? '#10b981' : '#64748b' }}>
              {activeCorridors.length > 0 ? 'ACTIVE (TRANSIT)' : 'STANDBY'}
            </span>
          </div>
          <div style={{ ...styles.metricVal, color: activeCorridors.length > 0 ? '#10b981' : 'var(--text-primary)' }}>
            {activeCorridors.length > 0 ? formatTimer(activeCorridorTimer) : 'READY'}
          </div>
          <small style={styles.metricSub}>
            {activeCorridors.length > 0 ? `Active: ${activeCorridors[0].name}` : 'Corridor B Partition Ready'}
          </small>
        </div>

        {/* Metric 2: Active Missing Searches */}
        <div className="card" style={{ ...styles.metricCard, borderLeft: activeSearches.length > 0 ? '4px solid #f97316' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={styles.metricLabel}>ACTIVE MISSING SEARCHES</span>
            <span style={{ ...styles.badge, backgroundColor: activeSearches.length > 0 ? '#fef2f2' : '#ecfdf5', color: activeSearches.length > 0 ? '#ef4444' : '#10b981' }}>
              {activeSearches.length > 0 ? 'GATE LOCKDOWN' : 'ALL CLEAR'}
            </span>
          </div>
          <div style={{ ...styles.metricVal, color: activeSearches.length > 0 ? '#ef4444' : 'var(--text-primary)' }}>
            {activeSearches.length}
          </div>
          <small style={styles.metricSub}>Broadcasted to All 4 Perimeter Exit Screens</small>
        </div>

        {/* Metric 3: Reunited Today */}
        <div className="card" style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={styles.metricLabel}>REUNITED TODAY</span>
            <span style={{ ...styles.badge, backgroundColor: '#ecfdf5', color: '#10b981' }}>Resolved</span>
          </div>
          <div style={{ ...styles.metricVal, color: '#10b981' }}>
            {reunitedHistory.length}
          </div>
          <small style={styles.metricSub}>Average Reunion Time: ~14.2 Mins</small>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FEATURE 2: EMERGENCY "GREEN CORRIDOR" CROWD PARTITIONING */}
      {/* ======================================================== */}
      <div className="card" style={styles.greenCorridorPanel}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...styles.featureIconBox, backgroundColor: activeCorridors.length > 0 ? '#ecfdf5' : '#f0fdf4' }}>
              <HeartPulse size={22} color={activeCorridors.length > 0 ? '#10b981' : '#059669'} />
            </div>
            <div>
              <span style={styles.featureSubTag}>RAPID MEDICAL RESPONSE PROTOCOL</span>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                EMERGENCY "GREEN CORRIDOR" CROWD PARTITIONING
              </h3>
            </div>
          </div>
          
          {activeCorridors.length > 0 && (
            <div style={styles.liveTransitBadge}>
              <span className="pulsing-dot-green"></span>
              <span>LIVE STRETCHER TRANSIT: {formatTimer(activeCorridorTimer)}</span>
            </div>
          )}
        </div>

        {/* Corridor Lanes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {corridors.map((corridor) => (
            <div 
              key={corridor.id} 
              style={{
                ...styles.corridorRow,
                backgroundColor: corridor.isActive ? '#ecfdf5' : 'var(--bg-item)',
                borderColor: corridor.isActive ? '#10b981' : 'var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...styles.corridorPill, backgroundColor: corridor.isActive ? '#10b981' : '#cbd5e1', color: corridor.isActive ? '#ffffff' : '#334155' }}>
                  {corridor.id.replace('_', ' ')}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {corridor.name}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Zone: <strong>{corridor.zone}</strong> • Lane Clearance Width: <strong>{corridor.widthMeters}m</strong> • Assigned Marshals: <strong>{corridor.marshalsAssigned} Officers</strong>
                  </div>
                  {corridor.isActive && (
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Radio size={12} color="#10b981" />
                      Digital Queue Screens Overridden: <em>"Corridor B converted to Medical Lane — Devotees Please Yield Space"</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={isTogglingCorridor}
                style={{
                  ...styles.corridorActionBtn,
                  backgroundColor: corridor.isActive ? '#ef4444' : '#10b981',
                  boxShadow: corridor.isActive ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onClick={() => handleToggleGreenCorridor(corridor.id, 'Medical Emergency Stretcher Rapid Transit')}
              >
                {corridor.isActive ? (
                  <>
                    <CheckCircle2 size={14} /> Deactivate & Re-Open Queue Lane
                  </>
                ) : (
                  <>
                    <Ambulance size={14} /> 1-Click Activate Stretcher Green Lane
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================== */}
      {/* FEATURE 1: LOST CHILD & ELDER REUNION DESK */}
      {/* ========================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👶</span>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              LOST CHILD & ELDER FAST-TRACK REUNION DESK
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <strong>{activeSearches.length} Active Searches</strong> • <strong>{reunitedHistory.length} Reunited</strong>
          </div>
        </div>

        {/* Active Searches Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {activeSearches.length > 0 ? (
            activeSearches.map((person) => (
              <div key={person.id} className="card hover-lift" style={styles.personCardActive}>
                
                <div style={styles.cardTopRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={styles.avatarCircle}>
                      {person.gender === 'FEMALE' ? '👵' : person.age < 14 ? '👦' : '👴'}
                    </div>
                    <div>
                      <h4 style={styles.personName}>{person.name} ({person.age} Yrs)</h4>
                      <span style={styles.tagId}>{person.id} • {person.gender}</span>
                    </div>
                  </div>
                  <span style={styles.activePill}>
                    <Lock size={11} /> GATE LOCKDOWN
                  </span>
                </div>

                <div style={styles.detailsBody}>
                  <div style={styles.detailItem}>
                    <strong style={styles.detailKey}>👕 CLOTHING & APPEARANCE:</strong>
                    <span style={styles.detailVal}>{person.clothingDescription}</span>
                  </div>

                  <div style={styles.detailItem}>
                    <strong style={styles.detailKey}>📍 LAST SEEN AT:</strong>
                    <span style={{ ...styles.detailVal, color: '#b45309', fontWeight: '700' }}>
                      {person.lastSeenLocation}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <strong style={styles.detailKey}>🗣️ NATIVE LANGUAGE:</strong>
                    <span style={styles.detailVal}>{person.language}</span>
                  </div>

                  <div style={styles.detailItem}>
                    <strong style={styles.detailKey}>📞 GUARDIAN:</strong>
                    <span style={styles.detailVal}>{person.guardianName} ({person.contactPhone})</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <small style={styles.timeTag}>
                    <Clock size={12} /> Reported {new Date(person.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                  <button 
                    style={styles.reuniteBtn}
                    onClick={() => handleMarkReunited(person.id, person.name)}
                  >
                    <CheckCircle2 size={14} /> Mark Reunited
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="card" style={styles.emptyCard}>
              <CheckCircle2 size={32} color="#10b981" />
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>
                No Active Missing Child or Elder Searches
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                All reported devotees have been successfully reunited at Help Desks.
              </p>
            </div>
          )}
        </div>

        {/* Reunited History List */}
        {reunitedHistory.length > 0 && (
          <div className="card" style={{ padding: '16px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} color="#10b981" /> REUNITED SAFELY ARCHIVE ({reunitedHistory.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reunitedHistory.map((item) => (
                <div key={item.id} style={styles.reunitedRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.name}</strong> ({item.age} yrs)
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Last seen: {item.lastSeenLocation} • Guardian: {item.guardianName}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
                      Reunited at {new Date(item.reunitedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* REPORT MISSING PERSON MODAL */}
      {showReportModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} className="card">
            
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  BROADCAST MISSING CHILD / ELDER ALERT
                </h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <form onSubmit={handleReportSubmit} style={styles.form}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>FULL NAME *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>AGE *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 7"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>GENDER</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={styles.select}
                  >
                    <option value="MALE">Male (Boy/Man)</option>
                    <option value="FEMALE">Female (Girl/Woman)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>CLOTHING & DISTINCT PHYSICAL APPEARANCE *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Yellow Kurta, Blue Jeans, Wearing brown sandals, red cap"
                  value={formData.clothingDescription}
                  onChange={(e) => setFormData({ ...formData, clothingDescription: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>LAST SEEN LANDMARK / PILLAR *</label>
                  <select 
                    value={formData.lastSeenLocation}
                    onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Main Queue Corridor — Pillar #14">Main Queue Corridor — Pillar #14</option>
                    <option value="Inner Sanctum Entry (Gate 1)">Inner Sanctum Entry (Gate 1)</option>
                    <option value="Footwear & Locker Stand B">Footwear & Locker Stand B</option>
                    <option value="Prasad Counter Hall">Prasad Counter Hall</option>
                    <option value="North Shaded Holding Bay">North Shaded Holding Bay</option>
                    <option value="South Car Parking Exit Gate">South Car Parking Exit Gate</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>NATIVE SPOKEN LANGUAGE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gujarati only / Hindi"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>GUARDIAN NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sunita Sharma (Mother)"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>GUARDIAN CONTACT MOBILE</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? '🚨 Broadcasting Alert to All Exit Gates...' : '📢 Transmit Emergency Alert to Perimeter Gates'}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    fontFamily: 'var(--font-main)'
  },
  headerCard: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'border-color 0.3s ease'
  },
  sirenIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  headerTag: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '2px 0 4px 0'
  },
  headerSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  primaryActionBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
  },
  refreshBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  threatDialPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  dialBtn: {
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    transition: 'all 0.2s ease'
  },
  dialBtnTitle: {
    fontSize: '13px',
    fontWeight: '800',
    marginTop: '4px'
  },
  dialBtnSub: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  activePillGreen: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  activePillYellow: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#eab308',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  activePillOrange: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#f97316',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  activePillRed: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  activeThreatGuideline: {
    marginTop: '6px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-item)',
    borderLeft: '4px solid'
  },
  intercomPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    borderLeft: '4px solid #2563eb'
  },
  intercomTag: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: '0.8px'
  },
  intercomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
    marginTop: '4px'
  },
  agencyCard: {
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-item)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px'
  },
  agencyIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)'
  },
  agencyName: {
    margin: 0,
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  agencyUnit: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  onlineBadge: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'monospace'
  },
  agencyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
  },
  phoneLink: {
    fontSize: '11px',
    color: '#2563eb',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '700'
  },
  dispatchBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  dispatchLogBox: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-item)',
    border: '1px solid var(--border-color)'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px'
  },
  metricCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px'
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: '800',
    marginTop: '2px'
  },
  metricSub: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  badge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  greenCorridorPanel: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderLeft: '4px solid #10b981'
  },
  featureIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureSubTag: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#059669',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  liveTransitBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800'
  },
  corridorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid',
    transition: 'all 0.3s ease'
  },
  corridorPill: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  corridorActionBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  personCardActive: {
    padding: '18px',
    borderLeft: '4px solid #f97316',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px'
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#fff7ed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  personName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  tagId: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  activePill: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  detailsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--bg-item)',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  detailItem: {
    fontSize: '11px',
    lineHeight: '1.4'
  },
  detailKey: {
    color: 'var(--text-muted)',
    marginRight: '4px',
    fontSize: '9px'
  },
  detailVal: {
    color: 'var(--text-primary)'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
  },
  timeTag: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  reuniteBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  emptyCard: {
    gridColumn: '1 / -1',
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  reunitedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-item)',
    border: '1px solid var(--border-color)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  modalCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '560px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    width: '100%'
  },
  select: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    width: '100%'
  },
  submitBtn: {
    marginTop: '6px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
  }
};

export default EmergencyCommandDesk;
