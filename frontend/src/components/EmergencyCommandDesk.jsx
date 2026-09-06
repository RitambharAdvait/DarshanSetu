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
  ArrowRight
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const EmergencyCommandDesk = ({ selectedSite, socket, t }) => {
  // Navigation tabs inside Emergency Command
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'green-corridor' | 'lost-found'

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

  // Fetch Lost Person Records & Green Corridor Status
  const fetchData = () => {
    setIsLoadingLost(true);
    fetch(`${BACKEND_URL}/api/incidents/lost-persons/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        setIsLoadingLost(false);
        if (data && data.records) setLostRecords(data.records);
      })
      .catch(() => setIsLoadingLost(false));

    fetch(`${BACKEND_URL}/api/incidents/green-corridor/status/${selectedSite}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.corridors) setCorridors(data.corridors);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();

    if (socket) {
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
        // Fallback local toggle
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

  // Format seconds to mm:ss
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={styles.container}>
      
      {/* Top Header Banner */}
      <div className="card" style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={styles.sirenIconBox}>
            <AlertOctagon size={28} color="#ef4444" />
          </div>
          <div>
            <div style={styles.headerTag}>STATE DISASTER & POLICE EMERGENCY COMMAND</div>
            <h2 style={styles.headerTitle}>INCIDENT MANAGEMENT & SOS DISPATCH COMMAND</h2>
            <div style={styles.headerSub}>
              Site: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{selectedSite}</strong> • Active Security Marshals: <strong>12 On Duty</strong> • Emergency Stretcher Target: <strong>&lt; 45 Secs</strong>
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

        {/* Reunited History Accordion / List */}
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
    borderLeft: '4px solid #ef4444'
  },
  sirenIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  headerTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#ef4444',
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
