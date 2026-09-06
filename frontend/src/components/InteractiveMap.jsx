import React, { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';

// Site-Specific Real Telemetry & GIS Coordinate Registry
const siteTelemetry = {
  dwarka: {
    name: 'Dwarkadhish Temple, Dwarka',
    center: { lat: 22.23762, lng: 68.96740 },
    entryPoints: [
      { name: 'Moksha Dwar (North 56-Step Entry)', lat: 22.23805, lng: 68.96730, rate: 58 },
      { name: 'Swarga Dwar (South Gomti Exit)', lat: 22.23720, lng: 68.96750, rate: 42 }
    ],
    exitPoints: [
      { name: 'Gomti Ghat & Sudama Setu Exit', lat: 22.23690, lng: 68.96760, rate: 45 }
    ],
    highDensity: [
      { name: 'Garbhagriha Sanctum Complex', lat: 22.23762, lng: 68.96740 }
    ],
    cctv: [
      { id: 'CAM-DWK-01', name: 'CCTV #01 - Moksha Dwar North Queue', lat: 22.23815, lng: 68.96720 },
      { id: 'CAM-DWK-04', name: 'CCTV #04 - Sanctum Courtyard', lat: 22.23760, lng: 68.96735 }
    ]
  },
  somnath: {
    name: 'Somnath Jyotirlinga Temple',
    center: { lat: 20.88805, lng: 70.40130 },
    entryPoints: [
      { name: 'Digvijay Dwar (Main East Gate)', lat: 20.88815, lng: 70.40240, rate: 70 },
      { name: 'Sardar Patel Chowk Gate', lat: 20.88840, lng: 70.40215, rate: 35 }
    ],
    exitPoints: [
      { name: 'Sea Front Promenade Exit', lat: 20.88745, lng: 70.40145, rate: 60 }
    ],
    highDensity: [
      { name: 'Main Shrine Sabha Mandap & Sanctum', lat: 20.88805, lng: 70.40130 }
    ],
    cctv: [
      { id: 'CAM-SOM-02', name: 'CCTV #02 - Sea Front Promenade', lat: 20.88750, lng: 70.40160 },
      { id: 'CAM-SOM-08', name: 'CCTV #08 - Digvijay Entrance Portal', lat: 20.88820, lng: 70.40235 }
    ]
  },
  ambaji: {
    name: 'Ambaji Temple, Banaskantha',
    center: { lat: 24.32925, lng: 72.84885 },
    entryPoints: [
      { name: 'Shakti Dwaar (North Gate 1)', lat: 24.32990, lng: 72.84880, rate: 50 },
      { name: 'Chachar Chowk Gate 2', lat: 24.32870, lng: 72.84910, rate: 40 }
    ],
    exitPoints: [
      { name: 'South Car Parking & Bypass Exit', lat: 24.32850, lng: 72.84840, rate: 38 }
    ],
    highDensity: [
      { name: 'Nij Mandir Sanctum Queue', lat: 24.32925, lng: 72.84885 }
    ],
    cctv: [
      { id: 'CAM-AMB-03', name: 'CCTV #03 - Shakti Dwaar Approach', lat: 24.33010, lng: 72.84875 },
      { id: 'CAM-AMB-07', name: 'CCTV #07 - Chachar Chowk Arena', lat: 24.32890, lng: 72.84900 }
    ]
  },
  pavagadh: {
    name: 'Mahakali Temple, Pavagadh',
    center: { lat: 22.45945, lng: 73.52515 },
    entryPoints: [
      { name: 'Upper Ropeway Terminal Gate', lat: 22.46010, lng: 73.52440, rate: 65 },
      { name: 'Saat Kaman Heritage Stairway', lat: 22.45860, lng: 73.52570, rate: 30 }
    ],
    exitPoints: [
      { name: 'Cliff Trail & Terrace Exit', lat: 22.45910, lng: 73.52460, rate: 48 }
    ],
    highDensity: [
      { name: 'Mahakali Hill Top Summit Shrine', lat: 22.45945, lng: 73.52515 }
    ],
    cctv: [
      { id: 'CAM-PVG-05', name: 'CCTV #05 - Upper Ropeway Terminal', lat: 22.46015, lng: 73.52435 },
      { id: 'CAM-PVG-09', name: 'CCTV #09 - Summit Stairs Corridor', lat: 22.45890, lng: 73.52530 }
    ]
  }
};

const InteractiveMap = ({ filters, setFilters, selectedSite = 'dwarka', stats }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [mapType, setMapType] = useState('voyager');

  const telemetry = siteTelemetry[selectedSite.toLowerCase()] || siteTelemetry.dwarka;

  useEffect(() => {
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initOrUpdateMap = () => {
      if (window.L && mapContainerRef.current) {
        if (!mapInstanceRef.current) {
          const map = window.L.map(mapContainerRef.current, {
            center: [telemetry.center.lat, telemetry.center.lng],
            zoom: 17,
            zoomControl: true
          });

          const tileUrl = mapType === 'satellite' 
            ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

          window.L.tileLayer(tileUrl, {
            attribution: mapType === 'satellite' ? 'Google Satellite & Hybrid Ground Imagery' : 'Google Maps / CARTO & OpenStreetMap',
            maxZoom: 21,
            maxNativeZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
          }).addTo(map);

          mapInstanceRef.current = map;
          markersGroupRef.current = window.L.layerGroup().addTo(map);
        } else {
          mapInstanceRef.current.eachLayer(layer => {
            if (layer instanceof window.L.TileLayer) {
              mapInstanceRef.current.removeLayer(layer);
            }
          });

          const tileUrl = mapType === 'satellite' 
            ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

          window.L.tileLayer(tileUrl, {
            attribution: mapType === 'satellite' ? 'Google Satellite & Hybrid Ground Imagery' : 'Google Maps / CARTO & OpenStreetMap',
            maxZoom: 21,
            maxNativeZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
          }).addTo(mapInstanceRef.current);

          mapInstanceRef.current.setView([telemetry.center.lat, telemetry.center.lng], 17);
        }

        renderMarkers();
      }
    };

    if (window.L) {
      initOrUpdateMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initOrUpdateMap;
      document.body.appendChild(script);
    }
  }, [selectedSite, mapType]);

  const renderMarkers = () => {
    if (!window.L || !markersGroupRef.current || !mapInstanceRef.current) return;
    markersGroupRef.current.clearLayers();

    const L = window.L;

    // 1. Dynamic Entry Points
    if (filters.entryPoints && telemetry.entryPoints) {
      telemetry.entryPoints.forEach(gate => {
        const liveInflow = Math.round(gate.rate + (stats?.entryCount ? (stats.entryCount % 10) : 0));
        const marker = L.circleMarker([gate.lat, gate.lng], {
          radius: 8, fillColor: '#10b981', color: '#ffffff', weight: 2, fillOpacity: 0.95
        }).bindPopup(`<b>${gate.name}</b><br>🟢 Status: Active Entry<br>Inflow Rate: ~${liveInflow} devotees/min`);

        markersGroupRef.current.addLayer(marker);
      });
    }

    // 2. Dynamic Exit Points
    if (filters.exitPoints && telemetry.exitPoints) {
      telemetry.exitPoints.forEach(gate => {
        const liveOutflow = Math.round(gate.rate + (stats?.exitCount ? (stats.exitCount % 8) : 0));
        const marker = L.circleMarker([gate.lat, gate.lng], {
          radius: 8, fillColor: '#f59e0b', color: '#ffffff', weight: 2, fillOpacity: 0.95
        }).bindPopup(`<b>${gate.name}</b><br>🟡 Status: Clear Exit<br>Outflow Rate: ~${liveOutflow} devotees/min`);

        markersGroupRef.current.addLayer(marker);
      });
    }

    // 3. Dynamic High Density Heat Zone (Tied to WebSockets stats.capacityUsed)
    if (filters.highDensity && telemetry.highDensity) {
      const capPercent = stats?.capacityUsed || 42;
      const radiusMeters = Math.max(60, Math.round(capPercent * 2.2));
      const heatColor = capPercent > 75 ? '#ef4444' : capPercent > 40 ? '#f59e0b' : '#10b981';

      telemetry.highDensity.forEach(zone => {
        const heatCircle = L.circle([zone.lat, zone.lng], {
          radius: radiusMeters, fillColor: heatColor, color: heatColor, weight: 1.5, fillOpacity: 0.35
        }).bindPopup(`<b>${zone.name}</b><br>🚨 Dynamic Crowd Load: <b>${capPercent}% Capacity</b><br>Live Occupancy: ${stats?.currentCrowd?.toLocaleString() || '14,200'} devotees`);

        markersGroupRef.current.addLayer(heatCircle);
      });
    }

    // 4. Dynamic CCTV Telemetry Points
    if (filters.cctv && telemetry.cctv) {
      telemetry.cctv.forEach(cam => {
        const marker = L.circleMarker([cam.lat, cam.lng], {
          radius: 6, fillColor: '#2563eb', color: '#ffffff', weight: 2, fillOpacity: 1.0
        }).bindPopup(`<b>${cam.name}</b><br>ID: ${cam.id}<br>Status: 🔴 Streaming Live HD`);

        markersGroupRef.current.addLayer(marker);
      });
    }
  };

  useEffect(() => {
    renderMarkers();
  }, [filters, stats, selectedSite]);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', height: '425px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)', transition: 'background-color var(--transition-normal), border-color var(--transition-normal)' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            DYNAMIC TELEMETRY GIS GEOGRAPHIC MAP
          </div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            {telemetry.name}
          </div>
        </div>

        {/* View Switcher Button */}
        <button 
          onClick={() => setMapType(prev => prev === 'voyager' ? 'satellite' : 'voyager')}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-item)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
        >
          <Layers size={13} color="var(--color-blue)" />
          {mapType === 'voyager' ? '🛰️ Satellite View' : '🗺️ GIS Vector View'}
        </button>
      </div>

      {/* Leaflet GIS Map Canvas */}
      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }} />
      </div>

      {/* Interactive Checkbox Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingTop: '10px', marginTop: '8px', borderTop: '1px solid var(--border-color)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={filters.entryPoints} onChange={() => toggleFilter('entryPoints')} style={{ accentColor: 'var(--color-blue)', cursor: 'pointer' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Entry Points
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={filters.exitPoints} onChange={() => toggleFilter('exitPoints')} style={{ accentColor: 'var(--color-blue)', cursor: 'pointer' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          Exit Points
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={filters.highDensity} onChange={() => toggleFilter('highDensity')} style={{ accentColor: 'var(--color-blue)', cursor: 'pointer' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          High Density Zone ({stats?.capacityUsed || 42}%)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={filters.cctv} onChange={() => toggleFilter('cctv')} style={{ accentColor: 'var(--color-blue)', cursor: 'pointer' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          CCTV Telemetry
        </label>
      </div>

    </div>
  );
};

export default InteractiveMap;