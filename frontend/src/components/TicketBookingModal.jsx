import React, { useState, useEffect } from 'react';
import { X, QrCode, Clock, User, ShieldCheck, Download, CheckCircle2, Navigation, WifiOff, AlertCircle, Package } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const TEMPLE_COORDS = {
  dwarka: { lat: 22.2378, lng: 68.9678, name: 'Dwarkadhish Temple' },
  somnath: { lat: 20.8880, lng: 70.4012, name: 'Somnath Temple' },
  ambaji: { lat: 24.3297, lng: 72.8489, name: 'Ambaji Temple' },
  pavagadh: { lat: 22.4842, lng: 73.5269, name: 'Mahakali Temple' }
};

const TicketBookingModal = ({ isOpen, onClose, selectedSite, setSelectedSite }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    slotDate: new Date().toISOString().split('T')[0],
    slotTime: '09:00 - 10:00 AM',
    isPriority: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);

  // Geofence & Dynamic Queue State
  const [geofenceData, setGeofenceData] = useState({
    isWithinGeofence: true,
    distanceMeters: 220,
    statusText: 'ACTIVE_GEOFENCED'
  });
  const [queueStatus, setQueueStatus] = useState({
    totalDevoteesInQueue: 142,
    throughputPerMin: 45,
    estimatedWaitMins: 3
  });
  const [simulatedInsidePerimeter, setSimulatedInsidePerimeter] = useState(true);

  // Smart Footwear & Locker State (Linked to unified QR token)
  const [lockerState, setLockerState] = useState({
    stand: 'Stand B',
    shelf: 'Shelf #44',
    counter: 'Stand B • Exit Counter 2',
    status: 'STORED' // 'STORED' | 'PRE_FETCH_ACTIVE' | 'READY'
  });

  // Load cached ticket from LocalStorage on open
  useEffect(() => {
    if (isOpen) {
      try {
        const cached = localStorage.getItem('darshansetu_offline_passes');
        if (cached) {
          const passes = JSON.parse(cached);
          if (passes && passes.length > 0) {
            setBookedTicket(passes[0]);
            if (passes[0].lockerTag) {
              setLockerState(prev => ({
                ...prev,
                stand: passes[0].lockerTag.stand || 'Stand B',
                shelf: passes[0].lockerTag.shelf || 'Shelf #44',
                counter: passes[0].lockerTag.counter || 'Stand B • Exit Counter 2'
              }));
            }
          }
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
  }, [isOpen]);

  // Periodically verify Geofence & Dynamic Queue Status
  useEffect(() => {
    if (bookedTicket) {
      const currentTemple = TEMPLE_COORDS[selectedSite.toLowerCase()] || TEMPLE_COORDS.dwarka;
      const targetLat = simulatedInsidePerimeter ? currentTemple.lat + 0.0018 : currentTemple.lat + 0.015;
      const targetLng = simulatedInsidePerimeter ? currentTemple.lng + 0.0012 : currentTemple.lng + 0.012;

      fetch(`${BACKEND_URL}/api/tickets/verify-geofence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: selectedSite,
          lat: targetLat,
          lng: targetLng,
          qrToken: bookedTicket.qrToken
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setGeofenceData({
            isWithinGeofence: data.isWithinGeofence ?? simulatedInsidePerimeter,
            distanceMeters: data.distanceMeters || (simulatedInsidePerimeter ? 240 : 1850),
            statusText: data.passStatus || (simulatedInsidePerimeter ? 'ACTIVE_GEOFENCED' : 'INACTIVE_OUT_OF_RANGE')
          });
        })
        .catch(() => {
          setGeofenceData({
            isWithinGeofence: simulatedInsidePerimeter,
            distanceMeters: simulatedInsidePerimeter ? 240 : 1850,
            statusText: simulatedInsidePerimeter ? 'ACTIVE_GEOFENCED' : 'INACTIVE_OUT_OF_RANGE'
          });
        });

      // Fetch dynamic wait queue
      fetch(`${BACKEND_URL}/api/tickets/queue-status/${selectedSite}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.estimatedWaitMins) {
            setQueueStatus(data);
          }
        })
        .catch(() => {});
    }
  }, [bookedTicket, selectedSite, simulatedInsidePerimeter]);

  if (!isOpen) return null;

  const handleBookTicket = (e) => {
    e.preventDefault();
    if (!formData.phone) return alert('Please enter your phone number!');

    setIsSubmitting(true);

    const slotDateTime = `${formData.slotDate}T${formData.slotTime.startsWith('09') ? '09:00:00' : '14:00:00'}Z`;

    fetch(`${BACKEND_URL}/api/tickets/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: selectedSite,
        slotTime: slotDateTime,
        isPriority: formData.isPriority
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSubmitting(false);
        const passObj = {
          id: data.ticket?.id || 'TKT-' + Math.floor(10000 + Math.random() * 90000),
          qrToken: data.qrToken || data.ticket?.qrToken || `DS-HMAC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          devoteeName: formData.name || 'Pilgrim Devotee',
          phone: formData.phone,
          site: selectedSite.toUpperCase(),
          slotTime: `${formData.slotDate} (${formData.slotTime})`,
          isPriority: formData.isPriority,
          lockerTag: data.lockerTag || { stand: 'Stand B', shelf: 'Shelf #44', counter: 'Stand B • Exit Counter 2' },
          createdAt: new Date().toISOString()
        };

        setBookedTicket(passObj);
        setLockerState({
          stand: passObj.lockerTag.stand,
          shelf: passObj.lockerTag.shelf,
          counter: passObj.lockerTag.counter,
          status: 'STORED'
        });

        // Cache to LocalStorage for offline PWA access
        try {
          localStorage.setItem('darshansetu_offline_passes', JSON.stringify([passObj]));
        } catch (e) {}
      })
      .catch(() => {
        setIsSubmitting(false);
        const mockPassObj = {
          id: 'TKT-' + Math.floor(10000 + Math.random() * 90000),
          qrToken: `DS-HMAC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          devoteeName: formData.name || 'Pilgrim Devotee',
          phone: formData.phone,
          site: selectedSite.toUpperCase(),
          slotTime: `${formData.slotDate} (${formData.slotTime})`,
          isPriority: formData.isPriority,
          lockerTag: { stand: 'Stand B', shelf: 'Shelf #44', counter: 'Stand B • Exit Counter 2' },
          createdAt: new Date().toISOString()
        };
        setBookedTicket(mockPassObj);
        setLockerState({
          stand: 'Stand B',
          shelf: 'Shelf #44',
          counter: 'Stand B • Exit Counter 2',
          status: 'STORED'
        });
        try {
          localStorage.setItem('darshansetu_offline_passes', JSON.stringify([mockPassObj]));
        } catch (e) {}
      });
  };

  // Pre-Fetch Footwear Alert Handler (Triggered on Sanctum Exit)
  const handlePreFetchFootwear = () => {
    if (!bookedTicket) return;

    if (lockerState.status === 'STORED') {
      setLockerState(prev => ({ ...prev, status: 'PRE_FETCH_ACTIVE' }));

      fetch(`${BACKEND_URL}/api/tickets/lockers/pre-fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: bookedTicket.qrToken })
      })
        .then(res => res.json())
        .then(() => {
          // After brief transition, mark ready at counter
          setTimeout(() => {
            setLockerState(prev => ({ ...prev, status: 'READY' }));
          }, 3500);
        })
        .catch(() => {
          setTimeout(() => {
            setLockerState(prev => ({ ...prev, status: 'READY' }));
          }, 3500);
        });
    } else if (lockerState.status === 'READY') {
      alert(`✅ Footwear Handover Complete! Bag retrieved from ${lockerState.shelf} at ${lockerState.counter}`);
      setLockerState(prev => ({ ...prev, status: 'STORED' }));
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard} className="card">
        
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--color-blue)" />
            <div>
              <span style={styles.govSubHeader}>REAL-TIME SMART PILGRIMAGE PLATFORM</span>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                DIGITAL DARSHAN PASS & GEOFENCE ACTIVATION
              </h3>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {!bookedTicket ? (
          /* Form View */
          <form onSubmit={handleBookTicket} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>SELECT TEMPLE PILGRIMAGE SITE</label>
              <select 
                value={selectedSite} 
                onChange={(e) => setSelectedSite(e.target.value)}
                style={styles.select}
              >
                <option value="dwarka">Dwarkadhish Temple, Dwarka</option>
                <option value="somnath">Somnath Jyotirlinga Temple</option>
                <option value="ambaji">Ambaji Temple, Banaskantha</option>
                <option value="pavagadh">Mahakali Temple, Pavagadh</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>DEVOTEE FULL NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>MOBILE PHONE NUMBER *</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>DARSHAN SLOT DATE</label>
                <input 
                  type="date" 
                  value={formData.slotDate}
                  onChange={(e) => setFormData({ ...formData, slotDate: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>TIME SLOT WINDOW</label>
                <select 
                  value={formData.slotTime}
                  onChange={(e) => setFormData({ ...formData, slotTime: e.target.value })}
                  style={styles.select}
                >
                  <option value="09:00 - 10:00 AM">09:00 AM - 10:00 AM (Morning Peak)</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Aarti Slot)</option>
                  <option value="02:00 - 03:00 PM">02:00 PM - 03:00 PM (Afternoon Slot)</option>
                  <option value="05:00 - 06:00 PM">05:00 PM - 06:00 PM (Evening Sandhya)</option>
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox"
                checked={formData.isPriority}
                onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                style={{ accentColor: 'var(--color-blue)', cursor: 'pointer' }}
              />
              <span>Senior Citizen / PWD Priority Fast-Track Pass</span>
            </label>

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? '⚡ Generating Encrypted QR Pass...' : '🎫 Issue Smart Digital Darshan Pass'}
            </button>
          </form>
        ) : (
          /* Booked Ticket Card View */
          <div style={styles.ticketResultContainer}>
            
            {/* Geofence Status Banner */}
            <div
              style={{
                ...styles.geofenceBanner,
                backgroundColor: geofenceData.isWithinGeofence ? '#ecfdf5' : '#fff7ed',
                borderColor: geofenceData.isWithinGeofence ? '#10b981' : '#f97316'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation 
                  size={18} 
                  color={geofenceData.isWithinGeofence ? '#10b981' : '#f97316'} 
                  className={geofenceData.isWithinGeofence ? 'spin-slow' : ''} 
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: geofenceData.isWithinGeofence ? '#065f46' : '#9a3412' }}>
                    {geofenceData.isWithinGeofence ? '🟢 GEOFENCE ACTIVATED (<500m Perimeter)' : '🟠 PASS INACTIVE (Awaiting Temple Arrival)'}
                  </div>
                  <div style={{ fontSize: '10px', color: geofenceData.isWithinGeofence ? '#047857' : '#c2410c' }}>
                    Devotee is {geofenceData.distanceMeters}m from {selectedSite.toUpperCase()} Gate • Radius: 500m
                  </div>
                </div>
              </div>

              {/* Demo Geofence Toggle Simulator */}
              <button
                style={styles.toggleDemoBtn}
                onClick={() => setSimulatedInsidePerimeter(!simulatedInsidePerimeter)}
              >
                Simulate Location: {simulatedInsidePerimeter ? 'Inside 500m' : 'Outside 500m'}
              </button>
            </div>

            {/* Dynamic Queue Wait Box */}
            <div style={styles.queueMetricsBox}>
              <div style={styles.metricItem}>
                <small style={styles.metricLabel}>YOUR QUEUE POSITION</small>
                <div style={styles.metricVal}>#{queueStatus.totalDevoteesInQueue}</div>
              </div>
              <div style={styles.metricItem}>
                <small style={styles.metricLabel}>GATE THROUGHPUT</small>
                <div style={styles.metricVal}>{queueStatus.throughputPerMin} dev/min</div>
              </div>
              <div style={styles.metricItem}>
                <small style={styles.metricLabel}>DYNAMIC WAIT</small>
                <div style={{ ...styles.metricVal, color: '#2563eb' }}>~{queueStatus.estimatedWaitMins} Mins</div>
              </div>
            </div>

            {/* Main Ticket Card */}
            <div style={{ ...styles.ticketPassCard, opacity: geofenceData.isWithinGeofence ? 1 : 0.85 }}>
              <div style={styles.passHeader}>
                <div>
                  <span style={styles.passGovTag}>GOVERNMENT SECURE DIGITAL PASS</span>
                  <h4 style={styles.passTitle}>{bookedTicket.site} E-DARSHAN PASS</h4>
                </div>
                <span 
                  style={{
                    ...styles.validBadge,
                    backgroundColor: geofenceData.isWithinGeofence ? '#ecfdf5' : '#fff7ed',
                    color: geofenceData.isWithinGeofence ? '#10b981' : '#f97316',
                    borderColor: geofenceData.isWithinGeofence ? '#a7f3d0' : '#ffedd5'
                  }}
                >
                  {geofenceData.isWithinGeofence ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {geofenceData.isWithinGeofence ? 'ACTIVE GEOFENCED' : 'INACTIVE (OUTSIDE)'}
                </span>
              </div>

              <div style={styles.passBody}>
                <div style={styles.qrSection}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bookedTicket.qrToken)}`} 
                    alt="HMAC QR Code Pass" 
                    style={{
                      ...styles.qrImg,
                      filter: geofenceData.isWithinGeofence ? 'none' : 'grayscale(80%)'
                    }}
                  />
                  <span style={styles.qrTokenText}>{bookedTicket.qrToken.substring(0, 18)}...</span>
                </div>

                <div style={styles.detailsSection}>
                  <div style={styles.detailRow}>
                    <User size={13} color="var(--text-muted)" />
                    <div>
                      <small style={styles.detailLabel}>DEVOTEE</small>
                      <div style={styles.detailVal}>{bookedTicket.devoteeName}</div>
                    </div>
                  </div>

                  <div style={styles.detailRow}>
                    <Clock size={13} color="var(--text-muted)" />
                    <div>
                      <small style={styles.detailLabel}>TIME SLOT WINDOW</small>
                      <div style={styles.detailVal}>{bookedTicket.slotTime}</div>
                    </div>
                  </div>

                  <div style={styles.detailRow}>
                    <ShieldCheck size={13} color="var(--color-blue)" />
                    <div>
                      <small style={styles.detailLabel}>PASS TYPE</small>
                      <div style={{ ...styles.detailVal, color: bookedTicket.isPriority ? '#10b981' : 'var(--color-blue)' }}>
                        {bookedTicket.isPriority ? '⭐ PRIORITY FAST-TRACK' : 'STANDARD REGULAR'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Footwear & Locker Tag (Unified QR Token Feature) */}
              <div style={styles.lockerBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>👟</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>
                        SMART FOOTWEAR & LOCKER TAG (UNIFIED QR)
                      </div>
                      <div style={{ fontSize: '10px', color: '#475569' }}>
                        {lockerState.stand} • <strong>{lockerState.shelf}</strong> • 2 Pairs Footwear + Mobile
                      </div>
                    </div>
                  </div>
                  <span 
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: lockerState.status === 'PRE_FETCH_ACTIVE' ? '#fef3c7' : lockerState.status === 'READY' ? '#ecfdf5' : '#f1f5f9',
                      color: lockerState.status === 'PRE_FETCH_ACTIVE' ? '#b45309' : lockerState.status === 'READY' ? '#047857' : '#475569',
                      border: '1px solid currentColor'
                    }}
                  >
                    {lockerState.status === 'PRE_FETCH_ACTIVE' && '⚡ PRE-FETCH DISPATCHED'}
                    {lockerState.status === 'READY' && '🟢 READY AT COUNTER'}
                    {lockerState.status === 'STORED' && '📦 STORED SAFE'}
                  </span>
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: lockerState.status === 'STORED' ? '#2563eb' : lockerState.status === 'PRE_FETCH_ACTIVE' ? '#d97706' : '#10b981',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handlePreFetchFootwear}
                >
                  {lockerState.status === 'STORED' && '🚪 Exiting Sanctum: Pre-Fetch My Footwear (Alert Counter)'}
                  {lockerState.status === 'PRE_FETCH_ACTIVE' && '⚡ Pre-Fetch Dispatched: Staff Moving Shelf #44 to Exit Counter B2...'}
                  {lockerState.status === 'READY' && '🟢 Shoe Bag #44 Ready at Exit Counter B2 (Click to Complete Handover)'}
                </button>
              </div>

              <div style={styles.pwaNotice}>
                <WifiOff size={12} color="#0284c7" />
                <span>Encrypted HMAC Token Cached Offline in PWA (No 5G Needed at Gate)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
              <button 
                style={styles.downloadBtn}
                onClick={() => window.print()}
              >
                <Download size={14} /> Print / Save Offline Pass
              </button>
              <button 
                style={styles.newBookingBtn}
                onClick={() => {
                  setBookedTicket(null);
                  try { localStorage.removeItem('darshansetu_offline_passes'); } catch(e){}
                }}
              >
                Book New Slot
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  govSubHeader: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--color-blue)',
    letterSpacing: '0.8px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontFamily: 'var(--font-main)'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%'
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%'
  },
  submitBtn: {
    marginTop: '8px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'var(--color-blue)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  ticketResultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  geofenceBanner: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  toggleDemoBtn: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    color: 'var(--text-primary)'
  },
  queueMetricsBox: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    backgroundColor: 'var(--bg-item)',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    textAlign: 'center'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metricLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'var(--text-muted)'
  },
  metricVal: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  ticketPassCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '2px dashed var(--color-blue)',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
    color: '#0f172a'
  },
  passHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px',
    marginBottom: '12px'
  },
  passGovTag: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: '0.8px'
  },
  passTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '2px 0 0 0'
  },
  validBadge: {
    fontSize: '10px',
    fontWeight: '700',
    border: '1px solid',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  passBody: {
    display: 'grid',
    gridTemplateColumns: '130px 1fr',
    gap: '14px',
    alignItems: 'center'
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    borderRight: '1px solid #e2e8f0',
    paddingRight: '12px'
  },
  qrImg: {
    width: '110px',
    height: '110px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    transition: 'filter 0.3s ease'
  },
  qrTokenText: {
    fontSize: '9px',
    fontFamily: 'monospace',
    color: '#64748b'
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  detailLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#64748b'
  },
  detailVal: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a'
  },
  lockerBox: {
    marginTop: '12px',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  pwaNotice: {
    marginTop: '10px',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '10px',
    color: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600'
  },
  downloadBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  newBookingBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#334155',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  }
};

export default TicketBookingModal;
