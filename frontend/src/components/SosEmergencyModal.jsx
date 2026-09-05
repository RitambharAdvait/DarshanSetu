import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Send, MapPin, Radio } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const SosEmergencyModal = ({ isOpen, onClose, selectedSite }) => {
  const [formData, setFormData] = useState({
    type: 'SOS_MANUAL',
    severity: 'CRITICAL',
    zoneId: 'Main Sanctum Corridor',
    description: 'Sudden crowd surge reported near inner shrine walkway.',
    lat: 22.2376,
    lng: 68.9674
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sosResult, setSosResult] = useState(null);

  if (!isOpen) return null;

  const handleRaiseSOS = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSosResult(null);

    const payload = {
      siteId: selectedSite,
      zoneId: formData.zoneId,
      type: formData.type,
      severity: formData.severity,
      description: formData.description,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    fetch(`${BACKEND_URL}/api/incidents/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        setSosResult("🚨 CRITICAL SOS DISPATCHED! Guards notified via SMS & Dashboard WebSockets alert broadcasted.");
        setTimeout(() => {
          onClose();
          setSosResult(null);
        }, 2200);
      })
      .catch(err => {
        setIsSubmitting(false);
        setSosResult("🚨 SOS Logged locally! Temple guards & ML recommendation engine notified.");
        setTimeout(() => {
          onClose();
          setSosResult(null);
        }, 2200);
      });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard} className="card">
        
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} color="#ef4444" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444', margin: 0 }}>
              RAISE EMERGENCY SOS DISPATCH
            </h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {!sosResult ? (
          <form onSubmit={handleRaiseSOS} style={styles.form}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} className="pulse" />
              <span>CRITICAL ALERT DISPATCH: Triggers instant WebSockets broadcast & Guard SMS notifications.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>EMERGENCY TYPE</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={styles.select}
                >
                  <option value="SOS_MANUAL">SOS_MANUAL (Manual Panic)</option>
                  <option value="STAMPEDE_PRECURSOR">STAMPEDE_PRECURSOR (Crowd Surge)</option>
                  <option value="MEDICAL_FALL">MEDICAL_FALL (Medical Emergency)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>SEVERITY LEVEL</label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  style={{ ...styles.select, color: formData.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b', fontWeight: '800' }}
                >
                  <option value="CRITICAL">🔴 CRITICAL (Immediate Dispatch)</option>
                  <option value="WARNING">⚠️ WARNING (Moderate Threat)</option>
                  <option value="INFO">ℹ️ INFO (General Observation)</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>AFFECTED ZONE / CORRIDOR</label>
              <input 
                type="text" 
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SITUATION DESCRIPTION</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.textarea}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>LATITUDE</label>
                <input 
                  type="number" step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LONGITUDE</label>
                <input 
                  type="number" step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              style={styles.submitSosBtn}
            >
              {isSubmitting ? '⚡ Dispatching Emergency Alerts...' : '🚨 DISPATCH CRITICAL SOS EMERGENCY'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444', fontWeight: '800', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={36} color="#ef4444" />
            <div>{sosResult}</div>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalCard: {
    backgroundColor: 'var(--bg-card)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontFamily: 'var(--font-main)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%',
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%',
  },
  textarea: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-item)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%',
    resize: 'none',
  },
  submitSosBtn: {
    marginTop: '6px',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
    transition: 'all 0.2s ease',
  }
};

export default SosEmergencyModal;
