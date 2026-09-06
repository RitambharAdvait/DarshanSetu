import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Layers, 
  Compass, 
  Droplet, 
  Ambulance, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Navigation, 
  Footprints, 
  ExternalLink, 
  CheckCircle2, 
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

import { SITES_DATA } from '../utils/siteData';

// Precision Geo-Telemetry & Checkpoint Registry for all 4 Shrines
export const TEMPLE_MAP_CONFIGS = {
  dwarka: {
    siteId: 'dwarka',
    name: 'Shri Dwarkadhish Temple (Jagat Mandir)',
    center: [22.2376, 68.9674],
    zoom: 18,
    gmapsUrl: 'https://maps.google.com/?q=Dwarkadhish+Temple+Dwarka',
    checkpoints: [
      { id: 'sanctum', type: 'sanctum', name: 'Nij Mandir Inner Sanctum (Garbhagriha)', coords: [22.2376, 68.9674], icon: '🕉️', desc: '5-story, 72-pillar central shrine housing Shri Dwarkadhish.', status: 'Open for Darshan' },
      { id: 'gate_moksha', type: 'gate', name: 'Moksha Dwaar (North 56-Step Entry)', coords: [22.2382, 68.9671], icon: '🚪', desc: 'Main pilgrim entry gate with security body scanners.', status: 'Wait: ~22 mins' },
      { id: 'gate_swarga', type: 'gate', name: 'Swarga Dwaar (East Exit & Gomti View)', coords: [22.2371, 68.9681], icon: '🚪', desc: 'Exit gate leading towards Gomti Ghat and Sudama Setu.', status: 'Smooth Flow' },
      { id: 'shoes', type: 'shoes', name: 'Footwear Counter & Locker Stand B', coords: [22.2384, 68.9685], icon: '👟', desc: 'Free safe deposit for shoes, mobile phones, and leather items.', status: 'Free Token Issued' },
      { id: 'water', type: 'water', name: 'RO Chilled Drinking Water Post', coords: [22.2378, 68.9678], icon: '💧', desc: 'Continuous RO filtered drinking water with paper cones.', status: 'Active 24x7' },
      { id: 'medical', type: 'medical', name: '108 First Aid & Trauma Post', coords: [22.2385, 68.9668], icon: '🚑', desc: 'Paramedics, emergency stretchers, and cardiac response unit.', status: 'Doctor On-Duty' },
      { id: 'prasad', type: 'prasad', name: 'Dwarkadhish Chhappan Bhog & Prasad Hall', coords: [22.2370, 68.9668], icon: '🍬', desc: 'Authentic Mahaprasad packets and sacred tulsi bhog.', status: 'Counter Open' },
      { id: 'wheelchair', type: 'wheelchair', name: 'Senior Citizen & Wheelchair Ramp', coords: [22.2379, 68.9666], icon: '♿', desc: 'Dedicated gentle slope ramp for elderly and differently-abled.', status: 'Priority Seva' },
      { id: 'helpdesk', type: 'helpdesk', name: 'Police Control & Lost Family Desk', coords: [22.2383, 68.9674], icon: '👮', desc: 'Devbhumi Dwarka Police missing child helpdesk and PA broadcast.', status: 'Officers Active' }
    ],
    flowSteps: [
      { step: 1, title: 'Arrival & Baggage Deposit', desc: 'Deposit shoes and mobiles at Locker Stand B (East Plaza).' },
      { step: 2, title: 'Security Screening', desc: 'Pass through DFMD scanners at Moksha Dwaar (North Entry).' },
      { step: 3, title: 'Corridor Queue Holding', desc: 'Follow barricaded lanes past Pillar #14 into Sabha Mandap.' },
      { step: 4, title: 'Nij Mandir Darshan', desc: 'Receive divine darshan of Shri Dwarkanath at the sanctum.' },
      { step: 5, title: 'Mahaprasad Collection', desc: 'Collect consecrated prasad at Sharda Peeth Complex.' },
      { step: 6, title: 'Swarga Dwaar Exit', desc: 'Exit towards the scenic Gomti Ghat and Sudama Setu.' }
    ]
  },

  somnath: {
    siteId: 'somnath',
    name: 'Shri Somnath Jyotirlinga Temple',
    center: [20.8880, 70.4012],
    zoom: 18,
    gmapsUrl: 'https://maps.google.com/?q=Somnath+Temple+Prabhas+Patan',
    checkpoints: [
      { id: 'sanctum', type: 'sanctum', name: 'Jyotirlinga Garbhagriha & Sabha Mandap', coords: [20.8880, 70.4012], icon: '🔱', desc: 'First among 12 sacred Jyotirlingas, sea-facing sanctum.', status: 'Open for Darshan' },
      { id: 'gate_digvijay', type: 'gate', name: 'Digvijay Dwaar (Grand East Entrance)', coords: [20.8888, 70.4022], icon: '🚪', desc: 'Majestic ornamental entry gate with automated RFID scanners.', status: 'Wait: ~28 mins' },
      { id: 'gate_promenade', type: 'gate', name: 'Sea-Facing Promenade Exit Gate', coords: [20.8874, 70.4015], icon: '🚪', desc: 'Coastal promenade exit overlooking the Arabian Sea.', status: 'Smooth Flow' },
      { id: 'shoes', type: 'shoes', name: 'Somnath Trust Central Cloakroom', coords: [20.8890, 70.4018], icon: '👟', desc: 'Automated locker system & shoe deposit counter.', status: 'Active 24x7' },
      { id: 'water', type: 'water', name: 'Triveni Chilled RO Water Station', coords: [20.8883, 70.4019], icon: '💧', desc: 'Multiple dispensing taps along the main circumambulation rim.', status: 'Active 24x7' },
      { id: 'medical', type: 'medical', name: 'Somnath Trust Mobile ICU Unit', coords: [20.8878, 70.4028], icon: '🚑', desc: 'Equipped with defibrillator, oxygen, and on-site physician.', status: 'Doctor On-Duty' },
      { id: 'prasad', type: 'prasad', name: 'Shri Somnath Laddu & Bilva Prasad Counter', coords: [20.8872, 70.4008], icon: '🍬', desc: 'Certified pure ghee laddu prasad with tamper-proof seal.', status: 'Counter Open' },
      { id: 'wheelchair', type: 'wheelchair', name: 'Battery Carts & Divyang Priority Lane', coords: [20.8892, 70.4025], icon: '♿', desc: 'Free battery-operated buggies from parking to sanctum gate.', status: 'Free Seva' },
      { id: 'helpdesk', type: 'helpdesk', name: 'Gir Somnath Police Security Outpost', coords: [20.8886, 70.4016], icon: '👮', desc: '24x7 Police control room & coastal emergency response team.', status: 'Officers Active' }
    ],
    flowSteps: [
      { step: 1, title: 'Parking to Cloakroom', desc: 'Board battery buggy from parking to Central Cloakroom.' },
      { step: 2, title: 'Digvijay Dwaar Entry', desc: 'Fast-track security verification at the Grand East Portal.' },
      { step: 3, title: 'Holding Concourse', desc: 'Proceed through shaded queues with ocean breeze ventilation.' },
      { step: 4, title: 'Jyotirlinga Darshan', desc: 'Perform circumambulation and view the holy Jyotirlinga.' },
      { step: 5, title: 'Prasadam Counter', desc: 'Collect authentic Somnath laddu prasad at Gate 3.' },
      { step: 6, title: 'Sea Promenade Exit', desc: 'Enjoy the sound-and-light pavilion on the coastal promenade.' }
    ]
  },

  ambaji: {
    siteId: 'ambaji',
    name: 'Shri Arasuri Ambaji Shaktipeeth',
    center: [24.3314, 72.8519],
    zoom: 18,
    gmapsUrl: 'https://maps.google.com/?q=Ambaji+Temple+Banaskantha',
    checkpoints: [
      { id: 'sanctum', type: 'sanctum', name: 'Nij Mandir Suvarna Shikhara Sanctum', coords: [24.3314, 72.8519], icon: '🌺', desc: 'Golden dome sanctum containing the sacred Shree Yantra.', status: 'Open for Darshan' },
      { id: 'gate_shakti', type: 'gate', name: 'Shakti Dwaar (North Grand Gate 1)', coords: [24.3322, 72.8515], icon: '🚪', desc: 'Main marble gateway with baggage X-ray scanners.', status: 'Wait: ~35 mins' },
      { id: 'gate_chachar', type: 'gate', name: 'Chachar Chowk Fast Bypass Exit', coords: [24.3310, 72.8524], icon: '🚪', desc: 'Exit courtyard connecting to Gabbar Hill shuttle path.', status: 'Smooth Flow' },
      { id: 'shoes', type: 'shoes', name: 'Mega Footwear & Locker Counter', coords: [24.3326, 72.8510], icon: '👟', desc: 'High-capacity computerized shoe lockers (10,000 pairs).', status: 'Token Counter' },
      { id: 'water', type: 'water', name: 'Mountain Mineral RO Dispensers', coords: [24.3318, 72.8522], icon: '💧', desc: 'Purified mineral water stations across Chachar Chowk.', status: 'Active 24x7' },
      { id: 'medical', type: 'medical', name: 'Banas Mountain Rescue & Trauma Post', coords: [24.3308, 72.8512], icon: '🚑', desc: 'Equipped for high-altitude fatigue, oxygen, and first aid.', status: 'Doctor On-Duty' },
      { id: 'prasad', type: 'prasad', name: 'Ambaji Famous Mohanthal Prasad Hall', coords: [24.3305, 72.8528], icon: '🍬', desc: 'Fresh GI-tagged pure ghee Mohanthal prasad counter.', status: 'Counter Open' },
      { id: 'wheelchair', type: 'wheelchair', name: 'Paddayatri & Divyang Seva Ramp', coords: [24.3316, 72.8510], icon: '♿', desc: 'Smooth marble ramp with free attendant wheelchair seva.', status: 'Priority Seva' },
      { id: 'helpdesk', type: 'helpdesk', name: 'Banaskantha Police Pilgrim Desk', coords: [24.3320, 72.8518], icon: '👮', desc: 'Security supervision, child ID tagging, and lost broadcast.', status: 'Officers Active' }
    ],
    flowSteps: [
      { step: 1, title: 'North Plaza Arrival', desc: 'Deposit shoes at the computerized Mega Token Counter.' },
      { step: 2, title: 'Shakti Dwaar Security', desc: 'Pass through the high-throughput metal detectors at Gate 1.' },
      { step: 3, title: 'Chachar Chowk Bay', desc: 'Queue through the illuminated canopy holding zone.' },
      { step: 4, title: 'Suvarna Dome Darshan', desc: 'Receive blessings of Maa Amba at the Vishwa Yantra.' },
      { step: 5, title: 'Mohanthal Prasadam', desc: 'Collect fresh pure ghee Mohanthal at the dedicated stalls.' },
      { step: 6, title: 'Gabbar Yatra Route', desc: 'Proceed towards the Gabbar Hill passenger ropeway terminal.' }
    ]
  },

  pavagadh: {
    siteId: 'pavagadh',
    name: 'Shri Mahakali Dham (Pavagadh Hill)',
    center: [22.4649, 73.5350],
    zoom: 18,
    gmapsUrl: 'https://maps.google.com/?q=Kalika+Mata+Temple+Pavagadh',
    checkpoints: [
      { id: 'sanctum', type: 'sanctum', name: 'Summit Cliff Mahakali Sanctum Altar', coords: [22.4649, 73.5350], icon: '⛰️', desc: '800m cliff summit altar of Goddess Mahakali.', status: 'Open for Darshan' },
      { id: 'gate_ropeway', type: 'gate', name: 'Upper Ropeway Terminal Entry Gate', coords: [22.4642, 73.5335], icon: '🚡', desc: 'Direct entry platform from the Udan Khatola cable car.', status: 'Wait: ~40 mins' },
      { id: 'gate_stairs', type: 'gate', name: 'Saat Kaman Heritage Stairway Gate', coords: [22.4630, 73.5315], icon: '🚪', desc: 'Arrival point for devotees climbing the 2,000 heritage steps.', status: 'Moderate Flow' },
      { id: 'shoes', type: 'shoes', name: 'Hilltop & Machi Footwear Stations', coords: [22.4638, 73.5328], icon: '👟', desc: 'Locker hubs located at Machi base and the upper plateau.', status: 'Free Token' },
      { id: 'water', type: 'water', name: 'High-Altitude Mineral Water Kiosk', coords: [22.4645, 73.5342], icon: '💧', desc: 'Cooled mountain water dispensers with high-volume filters.', status: 'Active 24x7' },
      { id: 'medical', type: 'medical', name: 'Mountain Rescue & Stretcher Squad', coords: [22.4640, 73.5330], icon: '🚑', desc: 'Specialized high-angle rescue team and mobile oxygen post.', status: 'Rescue Team On-Duty' },
      { id: 'prasad', type: 'prasad', name: 'Maa Kalika Authentic Chhatra Bhog', coords: [22.4652, 73.5355], icon: '🍬', desc: 'Traditional coconut, peda, and mataji chunari counter.', status: 'Counter Open' },
      { id: 'wheelchair', type: 'wheelchair', name: 'Ropeway Priority Boarding Desk', coords: [22.4610, 73.5280], icon: '♿', desc: 'Dedicated priority boarding cabins for seniors & pregnant women.', status: 'Priority Seva' },
      { id: 'helpdesk', type: 'helpdesk', name: 'Panchmahal Police Hill Control Post', coords: [22.4635, 73.5320], icon: '👮', desc: 'Summit surveillance tower, hill safety alerts, and police squad.', status: 'Officers Active' }
    ],
    flowSteps: [
      { step: 1, title: 'Machi Base Ascent', desc: 'Choose between Udan Khatola Ropeway (6 mins) or Heritage Steps.' },
      { step: 2, title: 'Upper Plateau Checkpoint', desc: 'Deposit shoes at Upper Terminal Locker Counter.' },
      { step: 3, title: 'Dudhala Lake Corridors', desc: 'Queue through guarded cliffside safety corridors.' },
      { step: 4, title: 'Summit Mahakali Darshan', desc: 'Climb final steps to the sacred flag & sanctum altar.' },
      { step: 5, title: 'Chhatra Prasad Receipt', desc: 'Obtain sacred peda prasad and blessed red thread.' },
      { step: 6, title: 'Panoramic Descent', desc: 'Descend smoothly via ropeway or picturesque Saat Kaman trail.' }
    ]
  }
};

const TempleGuideMap = ({ selectedSite = 'dwarka', onOpenSosModal }) => {
  const [viewMode, setViewMode] = useState('satellite'); // 'satellite' | 'blueprint'
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'gate' | 'water' | 'shoes' | 'medical' | 'prasad' | 'wheelchair'
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'street'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const config = TEMPLE_MAP_CONFIGS[selectedSite.toLowerCase()] || TEMPLE_MAP_CONFIGS.dwarka;
  const siteData = SITES_DATA[selectedSite.toLowerCase()] || SITES_DATA.dwarka;

  // Filter checkpoints by category
  const filteredCheckpoints = config.checkpoints.filter(cp => {
    if (selectedFilter === 'all') return true;
    return cp.type === selectedFilter;
  });

  // Initialize or re-render Leaflet map
  useEffect(() => {
    if (viewMode !== 'satellite') return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      const L = window.L;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: config.center,
          zoom: config.zoom,
          zoomControl: false,
          maxZoom: 19,
          minZoom: 14
        });

        // Add custom zoom control in bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      } else {
        mapInstanceRef.current.setView(config.center, config.zoom);
      }

      // Update Tile Layer
      mapInstanceRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      const tileUrl = mapLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tileAttribution = mapLayer === 'satellite'
        ? 'Tiles &copy; Esri &mdash; High Resolution Satellite Ground Imagery'
        : 'Tiles &copy; CARTO & OpenStreetMap contributors';

      L.tileLayer(tileUrl, {
        attribution: tileAttribution,
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Render Checkpoint Markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        config.checkpoints.forEach(cp => {
          // Color badge based on type
          let pinColor = '#2563eb';
          if (cp.type === 'sanctum') pinColor = '#d97706';
          else if (cp.type === 'gate') pinColor = '#10b981';
          else if (cp.type === 'water') pinColor = '#0284c7';
          else if (cp.type === 'shoes') pinColor = '#f59e0b';
          else if (cp.type === 'medical') pinColor = '#ef4444';
          else if (cp.type === 'prasad') pinColor = '#059669';
          else if (cp.type === 'wheelchair') pinColor = '#7c3aed';
          else if (cp.type === 'helpdesk') pinColor = '#1e40af';

          const customHtml = `
            <div style="
              width: 34px; 
              height: 34px; 
              border-radius: 50%; 
              background-color: ${pinColor}; 
              border: 2.5px solid #ffffff; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.4); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              ${cp.icon}
            </div>
          `;

          const customIcon = L.divIcon({
            html: customHtml,
            className: 'custom-temple-pin',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18]
          });

          const marker = L.marker(cp.coords, { icon: customIcon });

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 190px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 16px;">${cp.icon}</span>
                <strong style="font-size: 12px; color: #0f172a;">${cp.name}</strong>
              </div>
              <p style="font-size: 11px; color: #475569; margin: 4px 0 6px 0; line-height: 1.3;">
                ${cp.desc}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <span style="font-size: 9px; font-weight: 800; color: #059669; background-color: #ecfdf5; padding: 2px 6px; borderRadius: 4px;">
                  ${cp.status}
                </span>
                <span style="font-size: 9px; color: #2563eb; font-weight: 700;">
                  GPS Verified
                </span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayerRef.current.addLayer(marker);
        });
      }
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    }
  }, [selectedSite, viewMode, mapLayer]);

  // Focus on specific checkpoint pin
  const focusOnCheckpoint = (cp) => {
    setActiveCheckpoint(cp.id);
    setViewMode('satellite');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(cp.coords, 19, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls Header */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="#2563eb" />
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              🗺️ {config.name.toUpperCase()} — INTERACTIVE PRECINCT NAVIGATOR
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            GPS-calibrated ground satellite map, pedestrian queue blueprint, and verified devotee seva stations.
          </p>
        </div>

        {/* View Mode Switcher (Satellite vs Blueprint) */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-item)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('satellite')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'satellite' ? '#2563eb' : 'transparent',
              color: viewMode === 'satellite' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            🛰️ HD Satellite Map
          </button>
          <button
            onClick={() => setViewMode('blueprint')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'blueprint' ? '#2563eb' : 'transparent',
              color: viewMode === 'blueprint' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Footprints size={14} />
            🏛️ Architectural Devotee Blueprint
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SATELLITE MAP VIEW CONTAINER                          */}
      {/* ======================================================== */}
      {viewMode === 'satellite' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', position: 'relative', border: '1px solid var(--border-color)' }}>
          
          {/* Map Sub-Layer Switcher Bar (Floating in Top Left) */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1000,
            display: 'flex',
            gap: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '5px 8px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button
              onClick={() => setMapLayer('satellite')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: mapLayer === 'satellite' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🛰️ Esri Satellite
            </button>
            <button
              onClick={() => setMapLayer('street')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: mapLayer === 'street' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🗺️ Clean Street
            </button>
            <a
              href={config.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Google Maps <ExternalLink size={10} />
            </a>
          </div>

          {/* Interactive Leaflet Map Div */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              width: '100%', 
              height: '480px', 
              backgroundColor: '#0f172a',
              zIndex: 1
            }} 
          />

          {/* Map Legend Overlay at Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: '800', color: '#94a3b8' }}>LEGEND:</span>
            <span>🕉️ Sanctum Altar</span>
            <span>🚪 Gates</span>
            <span>👟 Shoes/Lockers</span>
            <span>💧 RO Water</span>
            <span>🚑 Medical</span>
            <span>🍬 Prasad</span>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ARCHITECTURAL BLUEPRINT DEVOTEE ROUTE MASTERPLAN      */}
      {/* ======================================================== */}
      {viewMode === 'blueprint' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                🏛️ DEVOTEE CIRCULATION & QUEUE PRECINCT MASTERPLAN
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Standard Operating Procedure (SOP) pedestrian route to minimize fatigue and prevent bottlenecking.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '20px' }}>
              One-Way Crowd Inflow / Outflow
            </span>
          </div>

          {/* Pedestrian Route Sequential Flow Visualizer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {config.flowSteps.map((stepItem) => (
              <div 
                key={stepItem.step}
                className="card hover-lift"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-item)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    {stepItem.step}
                  </span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {stepItem.title}
                  </strong>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {stepItem.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Architectural Schematic Frame */}
          <div style={{
            padding: '24px',
            borderRadius: '14px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} color="#60a5fa" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#93c5fd' }}>
                  PRECINCT LAYOUT SCHEMATIC: {config.name.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '6px', color: '#cbd5e1' }}>
                Zone Map Scale: 1:500
              </span>
            </div>

            {/* Schematic Flow Nodes */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              overflowX: 'auto',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px' }}>🚪</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8' }}>Entry Gate</div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>DFMD & Scanners</small>
              </div>
              <div style={{ color: '#64748b', fontSize: '16px' }}>➔</div>

              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px' }}>👟</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#facc15' }}>Locker Hub</div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>Free Tokens</small>
              </div>
              <div style={{ color: '#64748b', fontSize: '16px' }}>➔</div>

              <div style={{ textAlign: 'center', minWidth: '110px' }}>
                <div style={{ fontSize: '24px' }}>🚶</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80' }}>Holding Bay</div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>Misters & Water</small>
              </div>
              <div style={{ color: '#64748b', fontSize: '16px' }}>➔</div>

              <div style={{ textAlign: 'center', minWidth: '120px', backgroundColor: '#3b82f6', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}>
                <div style={{ fontSize: '24px' }}>🕉️</div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#ffffff' }}>Nij Mandir</div>
                <small style={{ fontSize: '9px', color: '#e0e7ff' }}>Inner Sanctum</small>
              </div>
              <div style={{ color: '#64748b', fontSize: '16px' }}>➔</div>

              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px' }}>🍬</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#34d399' }}>Prasad Hall</div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>Mahaprasad</small>
              </div>
              <div style={{ color: '#64748b', fontSize: '16px' }}>➔</div>

              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px' }}>🚪</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#f87171' }}>Swarga Exit</div>
                <small style={{ fontSize: '9px', color: '#94a3b8' }}>Unrestricted Flow</small>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VERIFIED CHECKPOINTS & AMENITIES DIRECTORY CARDS      */}
      {/* ======================================================== */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              📍 TEMPLE CHECKPOINTS & DEVOTEE SEVA DIRECTORY
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Click "📍 Focus On Map" on any card to zoom to its exact geo-coordinates.
            </p>
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Places' },
              { id: 'sanctum', label: '🕉️ Sanctum' },
              { id: 'gate', label: '🚪 Gates' },
              { id: 'water', label: '💧 Water' },
              { id: 'shoes', label: '👟 Lockers' },
              { id: 'medical', label: '🚑 Medical' },
              { id: 'prasad', label: '🍬 Prasad' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: selectedFilter === filter.id ? '#2563eb' : 'var(--bg-item)',
                  color: selectedFilter === filter.id ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkpoints Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredCheckpoints.map((cp) => (
            <div 
              key={cp.id} 
              className="card hover-lift"
              style={{
                padding: '16px',
                border: activeCheckpoint === cp.id ? '2px solid #2563eb' : '1px solid var(--border-color)',
                backgroundColor: activeCheckpoint === cp.id ? '#eff6ff' : 'var(--bg-card)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-item)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {cp.icon}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {cp.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                    {cp.desc}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
                  {cp.status}
                </span>
                <button
                  onClick={() => focusOnCheckpoint(cp)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={12} />
                  Focus On Map
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default TempleGuideMap;
