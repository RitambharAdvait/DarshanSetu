import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Car, 
  FileText, 
  BarChart2, 
  Settings, 
  PhoneCall, 
  HelpCircle, 
  Info, 
  LogOut,
  QrCode,
  Sparkles,
  Compass,
  Calendar,
  ShieldAlert,
  Clock,
  HeartHandshake
} from 'lucide-react';

const Sidebar = ({ 
  activeModule, 
  setActiveModule, 
  userRole = 'admin', 
  setUserRole, 
  t, 
  onOpenTicketModal, 
  onOpenGuardScannerModal, 
  onOpenSosModal 
}) => {
  // Admin Navigation Modules
  const adminModules = [
    { id: 'dashboard', name: 'Command Overview', icon: LayoutDashboard },
    { id: 'live-crowd', name: t.liveCrowd, icon: Users },
    { id: 'forecast', name: t.forecast, icon: TrendingUp },
    { id: 'traffic', name: 'vahanFlow Mobility', icon: Car },
    { id: 'emergency', name: 'Emergency Command', icon: PhoneCall },
    { id: 'reports', name: 'Reports & Magisterial', icon: FileText },
    { id: 'analytics', name: t.analytics, icon: BarChart2 },
  ];

  // Pilgrim Navigation Items
  const pilgrimItems = [
    { id: 'pilgrim', name: 'Pilgrim Home', icon: Sparkles },
    { id: 'pilgrim-queue', name: 'Live Queue & Waits', icon: Clock },
    { id: 'pilgrim-planner', name: '14-Day Rush Forecast', icon: Calendar },
    { id: 'pilgrim-amenities', name: 'Temple Guide & Map', icon: Compass },
    { id: 'pilgrim-lost', name: 'Report Missing Member', icon: ShieldAlert },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Spacer for Top Header Alignment */}
      <div style={styles.headerSpacer}></div>

      {/* Current Role Badge */}
      <div style={{
        padding: '8px 12px',
        borderRadius: '10px',
        backgroundColor: userRole === 'pilgrim' ? '#eff6ff' : '#f8fafc',
        border: `1px solid ${userRole === 'pilgrim' ? '#bfdbfe' : '#cbd5e1'}`,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)' }}>CURRENT VIEW</span>
          <strong style={{ fontSize: '11px', color: userRole === 'pilgrim' ? '#2563eb' : '#0f172a' }}>
            {userRole === 'pilgrim' ? '📱 Devotee / Pilgrim' : '🏛️ Temple Admin / Police'}
          </strong>
        </div>
        <button
          type="button"
          style={{
            fontSize: '9px',
            fontWeight: '700',
            padding: '3px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: userRole === 'pilgrim' ? '#2563eb' : '#0f172a',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          onClick={() => {
            const nextRole = userRole === 'pilgrim' ? 'admin' : 'pilgrim';
            setUserRole(nextRole);
            setActiveModule(nextRole === 'pilgrim' ? 'pilgrim' : 'dashboard');
          }}
        >
          Switch ⇄
        </button>
      </div>

      {/* ======================================================== */}
      {/* PILGRIM ROLE SIDEBAR                                     */}
      {/* ======================================================== */}
      {userRole === 'pilgrim' ? (
        <>
          {/* Quick Book Darshan Pass Button */}
          <button 
            style={{
              ...styles.navItem,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '700',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
            onClick={onOpenTicketModal}
          >
            <QrCode size={18} style={{ marginRight: '10px' }} />
            <span style={styles.navText}>Book Darshan Pass</span>
          </button>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>PILGRIM SERVICES</div>
            {pilgrimItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.activeNavItem : {})
                  }}
                  onClick={() => setActiveModule(item.id)}
                >
                  <Icon size={18} style={isActive ? styles.activeIcon : styles.icon} />
                  <span style={styles.navText}>{item.name}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* ADMIN ROLE SIDEBAR                                       */
        /* ======================================================== */
        <>
          {/* Book Ticket Pass Button */}
          <button 
            style={{
              ...styles.navItem,
              backgroundColor: 'var(--color-blue-light)',
              color: 'var(--color-blue)',
              fontWeight: '700',
              marginBottom: '4px'
            }}
            onClick={onOpenTicketModal}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🎫</span>
            <span style={styles.navText}>Book Darshan Ticket</span>
          </button>

          {/* Security Guard Gate Scanner Button */}
          <button 
            style={{
              ...styles.navItem,
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              fontWeight: '700',
              marginBottom: '8px'
            }}
            onClick={onOpenGuardScannerModal}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🛡️</span>
            <span style={styles.navText}>Guard Gate Scanner</span>
          </button>

          {/* Admin Modules Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>ADMIN & POLICE COMMAND</div>
            {adminModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.activeNavItem : {})
                  }}
                  onClick={() => setActiveModule(item.id)}
                >
                  <Icon size={18} style={isActive ? styles.activeIcon : styles.icon} />
                  <span style={styles.navText}>{item.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Emergency Helpline Card */}
      <div style={styles.emergencyCard} onClick={onOpenSosModal} role="button" tabIndex={0}>
        <div style={styles.emergencyIconContainer}>
          <PhoneCall size={20} color="#ef4444" />
        </div>
        <div style={styles.emergencyInfo}>
          <div style={styles.emergencyLabel}>24x7 TEMPLE HELPLINE</div>
          <div style={styles.emergencyNumber}>112 / 108</div>
          <div style={styles.emergencySub}>Click for 1-Tap SOS</div>
        </div>
      </div>

      {/* Bottom Footer Items */}
      <div style={styles.bottomSection}>
        <button 
          style={{...styles.navItem, ...styles.bottomNavItem}}
          onClick={() => alert(t?.supportAlert || '📞 24x7 DarshanSetu Support Desk:\n• Helpline: 1800-200-108 (Toll-Free)\n• Police Control: 112\n• Medical Emergency: 108\n• Email: support@darshansetu.gov.in')}
        >
          <HelpCircle size={18} style={styles.icon} />
          <span style={styles.navText}>{t?.supportCenter || 'Support Center'}</span>
        </button>
        <button 
          style={{...styles.navItem, ...styles.bottomNavItem}}
          onClick={() => alert(t?.aboutAlert || '🕉️ DarshanSetu v2.4 (Enterprise Edition)\nIntelligent Multi-Temple Crowd Management, Conformal AI Forecasting & Rapid Magisterial Incident Audit Platform.')}
        >
          <Info size={18} style={styles.icon} />
          <span style={styles.navText}>{t?.aboutDialog || 'About Darshan Setu'}</span>
        </button>
        <button 
          style={{...styles.navItem, ...styles.logoutItem}}
          onClick={() => alert('🔒 Session secured. You can switch between Devotee/Pilgrim and Admin/Police views anytime using the top switcher.')}
        >
          <LogOut size={18} style={styles.logoutIcon} />
          <span style={styles.logoutText}>{t?.logout || 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 16px 24px 16px',
    overflowY: 'auto',
    flexShrink: 0,
  },
  headerSpacer: {
    height: '80px', // Match the header height
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-main)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
  },
  activeNavItem: {
    backgroundColor: 'var(--color-blue-light)',
    color: 'var(--color-blue)',
    fontWeight: '600',
  },
  icon: {
    marginRight: '12px',
    color: 'var(--text-muted)',
    transition: 'color 0.2s ease',
  },
  activeIcon: {
    marginRight: '12px',
    color: 'var(--color-blue)',
  },
  navText: {
    flex: 1,
  },
  section: {
    marginTop: '20px',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    paddingLeft: '14px',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  emergencyCard: {
    marginTop: '24px',
    backgroundColor: '#fef2f2',
    border: '1px dashed #fca5a5',
    borderRadius: '14px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'flash-glow 3s infinite',
  },
  emergencyIconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emergencyInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  emergencyLabel: {
    fontSize: '11px',
    color: '#991b1b',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ef4444',
    lineHeight: '1.2',
  },
  emergencySub: {
    fontSize: '10px',
    color: '#b91c1c',
    opacity: 0.8,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  bottomNavItem: {
    padding: '8px 12px',
    fontSize: '13px',
  },
  logoutItem: {
    padding: '8px 12px',
    fontSize: '13px',
    color: '#ef4444',
  },
  logoutIcon: {
    marginRight: '12px',
    color: '#fca5a5',
  },
  logoutText: {
    fontWeight: '600',
  }
};

export default Sidebar;
