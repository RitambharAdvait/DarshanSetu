// Comprehensive Real-Life Master Data Registry for Gujarat's 4 Sacred Pilgrimages

export const SITES_DATA = {
  dwarka: {
    id: 'dwarka',
    name: 'Shri Dwarkadhish Temple (Jagat Mandir)',
    shortName: 'Dwarka Dham',
    district: 'Devbhumi Dwarka, Gujarat',
    deity: 'Lord Krishna (Dwarkanath)',
    heritage: '2,500-year-old 7-tier sandstone spire on Arabian Sea coast & Gomti Ghat',
    coordinates: { lat: 22.2376, lng: 68.9674 },
    stats: {
      systemStatus: 'Operational',
      currentCrowd: 14200,
      todayVisitors: 285640,
      capacityLimit: 35000,
      capacityUsed: 41,
      entryCount: 15400,
      exitCount: 1200,
      activeZones: { current: 4, total: 8 },
      activeAlertsCount: 0,
      policeDeployed: 16,
      weatherImpact: 'Coastal Breeze (28°C / 72% Hum)',
      aiConfidence: 96.8,
      lastUpdated: 'Just now'
    },
    bottomMetrics: {
      todayVisitors: 285640,
      visitorsChange: '+14.2%',
      peakTime: '11:00 AM - 01:30 PM',
      predictionAccuracy: 96.8,
      accuracyChange: '+2.4%',
      highRiskZones: 1,
      riskZonesChange: '0',
      emergencyAlerts: 0,
      alertsChange: '0',
      avgWaitingTime: 22,
      waitingTimeChange: '-4 mins'
    },
    aartiSchedule: [
      { name: 'Mangala Bhor Aarti', time: '06:30 AM', status: 'COMPLETED' },
      { name: 'Shringar & Dhwajarohan', time: '09:00 AM', status: 'COMPLETED' },
      { name: 'Sandhya Maha Aarti', time: '07:30 PM', status: 'NEXT AARTI' },
      { name: 'Shayan Aarti', time: '08:30 PM', status: 'UPCOMING' }
    ],
    queueLanes: [
      { id: 'gate2', name: 'Swarga Dwaar (East Fast-Track Line)', waitMins: 18, density: 'Light', rate: 92 },
      { id: 'gate1', name: 'Moksha Dwaar (North 56-Step Sanctum Line)', waitMins: 32, density: 'Moderate', rate: 64 },
      { id: 'gate4', name: 'Sudama Setu & Senior Priority Ramp', waitMins: 8, density: 'Priority', rate: 40 }
    ],
    landmarks: [
      'Moksha Dwaar (North 56-Step Entry)',
      'Swarga Dwaar (Gomti Ghat Exit)',
      'Main Queue Corridor — Pillar #14',
      'Sudama Setu Suspension Bridge Chowk',
      'Chhappan Bhog / Sharda Peeth Hall',
      'Footwear Stand B (East Sea Plaza)'
    ],
    amenities: [
      { id: 'water', title: 'RO Drinking Water Posts', location: 'Pillars #4, #14 & Gomti Gate Plaza', tag: 'Free 24x7', color: '#e0f2fe' },
      { id: 'shoes', title: 'Footwear & Locker Station B', location: 'East Sea-Facing Plaza (Near Gate 2)', tag: 'Token Counter', color: '#fef3c7' },
      { id: 'medical', title: '108 First Aid & Trauma Post', location: 'Sudama Setu Approach & West Corridor', tag: 'Doctor On-Duty', color: '#fee2e2' },
      { id: 'prasad', title: 'Dwarkadhish Bhog & Prasad Hall', location: 'Sharda Peeth Complex (Gate 3)', tag: 'Authentic Mahaprasad', color: '#d1fae5' },
      { id: 'wheelchair', title: 'Senior Citizen & Wheelchair Ramp', location: 'Swarga Dwaar North Ramp', tag: 'Priority Seva', color: '#ede9fe' },
      { id: 'helpdesk', title: 'Dwarka Police Lost & Found Desk', location: 'Central Security Checkpoint (Gate 1)', tag: 'Officer Station', color: '#dbeafe' }
    ],
    emergencyAgencies: {
      police: 'Dwarka District Police (SP Office): 112 / 02892-234200',
      ambulance: '108 Trauma Unit 1 (East Gate Parking)',
      hospital: 'Dwarka Civil Hospital & Trauma Center (1.2 km)',
      fire: 'Dwarka Municipal Fire Tender (02892-234101)'
    }
  },

  somnath: {
    id: 'somnath',
    name: 'Shri Somnath Jyotirlinga Temple',
    shortName: 'Somnath Dham',
    district: 'Gir Somnath, Gujarat',
    deity: 'Lord Shiva (First of 12 Sacred Jyotirlingas)',
    heritage: 'Oceanfront stone monument atop Triveni Sangam with sound & light sea promenade',
    coordinates: { lat: 20.8880, lng: 70.4012 },
    stats: {
      systemStatus: 'Operational',
      currentCrowd: 21800,
      todayVisitors: 394200,
      capacityLimit: 50000,
      capacityUsed: 44,
      entryCount: 23100,
      exitCount: 1300,
      activeZones: { current: 5, total: 10 },
      activeAlertsCount: 0,
      policeDeployed: 22,
      weatherImpact: 'Sea Breeze / Coastal (27°C / 68% Hum)',
      aiConfidence: 97.4,
      lastUpdated: 'Just now'
    },
    bottomMetrics: {
      todayVisitors: 394200,
      visitorsChange: '+18.6%',
      peakTime: '05:30 PM - 08:00 PM (Aarti & Light Show)',
      predictionAccuracy: 97.4,
      accuracyChange: '+1.8%',
      highRiskZones: 1,
      riskZonesChange: '0',
      emergencyAlerts: 0,
      alertsChange: '0',
      avgWaitingTime: 28,
      waitingTimeChange: '-6 mins'
    },
    aartiSchedule: [
      { name: 'Prabhat Mangala Aarti', time: '07:00 AM', status: 'COMPLETED' },
      { name: 'Madhyahna Bhog Aarti', time: '12:00 PM', status: 'COMPLETED' },
      { name: 'Sandhya Maha Aarti', time: '07:00 PM', status: 'NEXT AARTI' },
      { name: 'Deepmala & Shayan Darshan', time: '09:30 PM', status: 'UPCOMING' }
    ],
    queueLanes: [
      { id: 'gate1', name: 'Digvijay Dwaar (Grand Main East)', waitMins: 38, density: 'Moderate', rate: 110 },
      { id: 'gate2', name: 'Triveni Sangam Promenade Line', waitMins: 15, density: 'Light', rate: 75 },
      { id: 'gate3', name: 'Sardar Patel Chowk Senior Ramp', waitMins: 6, density: 'Priority', rate: 50 }
    ],
    landmarks: [
      'Digvijay Dwaar (Main Grand Entrance)',
      'Triveni Sangam Gate 2 Promenade',
      'Sea-Facing Parikrama Corridor (Pillar #9)',
      'Baan Stambh (Arrow Pillar) Plaza',
      'Sardar Patel Statue Chowk',
      'Somnath Trust Central Cloakroom'
    ],
    amenities: [
      { id: 'water', title: 'RO Chilled Water Dispensers', location: 'Digvijay Dwaar & Sea Front Promenade', tag: 'Free 24x7', color: '#e0f2fe' },
      { id: 'shoes', title: 'Central Luggage & Footwear Stand', location: 'Main Entrance Plaza (Baan Stambh)', tag: 'Automated Token', color: '#fef3c7' },
      { id: 'medical', title: 'Somnath Trust 24x7 ICU Mobile Unit', location: 'Sea Front Promenade Exit Post', tag: 'Cardiac Care', color: '#fee2e2' },
      { id: 'prasad', title: 'Shri Somnath Laddu & Bilva Prasadam', location: 'Exit Corridor Gate 3 Complex', tag: 'Sacred Trust Counter', color: '#d1fae5' },
      { id: 'wheelchair', title: 'Free Battery Carts & Wheelchairs', location: 'Parking to Digvijay Gate 1', tag: 'Senior Priority', color: '#ede9fe' },
      { id: 'helpdesk', title: 'Gir Somnath Police Security Desk', location: 'Main Reception & Gate 1', tag: 'Police Help Desk', color: '#dbeafe' }
    ],
    emergencyAgencies: {
      police: 'Veraval & Somnath Police Division: 112 / 02876-231200',
      ambulance: '108 Somnath Trauma Rescue Post',
      hospital: 'Veraval Civil Hospital & Trauma Unit (5.4 km)',
      fire: 'Veraval Fire Station (02876-220101)'
    }
  },

  ambaji: {
    id: 'ambaji',
    name: 'Shri Arasuri Ambaji Shaktipeeth',
    shortName: 'Ambaji Dham',
    district: 'Banaskantha, Gujarat',
    deity: 'Goddess Amba (Heart of Sati - Vishwa Yantra)',
    heritage: 'Golden Kalash dome in Aravalli mountain pass, sacred Gabbar Hill pilgrimage center',
    coordinates: { lat: 24.3314, lng: 72.8519 },
    stats: {
      systemStatus: 'Operational',
      currentCrowd: 32400,
      todayVisitors: 512000,
      capacityLimit: 70000,
      capacityUsed: 46,
      entryCount: 34800,
      exitCount: 2400,
      activeZones: { current: 6, total: 12 },
      activeAlertsCount: 0,
      policeDeployed: 28,
      weatherImpact: 'Mountain Breezy (24°C / 58% Hum)',
      aiConfidence: 98.1,
      lastUpdated: 'Just now'
    },
    bottomMetrics: {
      todayVisitors: 512000,
      visitorsChange: '+22.4%',
      peakTime: '06:00 PM - 09:30 PM (Poonam Rush)',
      predictionAccuracy: 98.1,
      accuracyChange: '+3.1%',
      highRiskZones: 2,
      riskZonesChange: '0',
      emergencyAlerts: 0,
      alertsChange: '0',
      avgWaitingTime: 35,
      waitingTimeChange: '-5 mins'
    },
    aartiSchedule: [
      { name: 'Prabhat Mangala Aarti', time: '07:30 AM', status: 'COMPLETED' },
      { name: 'Rajbhog & Sringar Darshan', time: '12:00 PM', status: 'COMPLETED' },
      { name: 'Sandhya Maha Aarti', time: '07:00 PM', status: 'NEXT AARTI' },
      { name: 'Shayan Darshan Stuti', time: '09:00 PM', status: 'UPCOMING' }
    ],
    queueLanes: [
      { id: 'gate1', name: 'Shakti Dwaar (Main Nij Mandir Line)', waitMins: 45, density: 'High', rate: 140 },
      { id: 'gate2', name: 'Chachar Chowk Fast Bypass', waitMins: 22, density: 'Moderate', rate: 85 },
      { id: 'gate3', name: 'Gabbar Hill Ropeway Connector', waitMins: 50, density: 'High', rate: 60 }
    ],
    landmarks: [
      'Shakti Dwaar (North Grand Gate 1)',
      'Gabbar Hill Ropeway Terminal',
      'Suvarna Shikhara Golden Mandapam',
      'Chachar Chowk Central Holding Bay',
      'Mansarovar Kund Footpath (Pillar #18)',
      'Ambaji Trust Bhojanalaya Hall'
    ],
    amenities: [
      { id: 'water', title: 'Mountain Spring RO Water Points', location: 'Chachar Chowk & Gabbar Footpath', tag: 'Free 24x7', color: '#e0f2fe' },
      { id: 'shoes', title: 'Mega Footwear Token Center', location: 'North Parking Plaza Gate 1', tag: 'Automated Counters', color: '#fef3c7' },
      { id: 'medical', title: 'Banas Trauma & Mountain Rescue', location: 'Chachar Chowk East Post', tag: 'Oxygen & First Aid', color: '#fee2e2' },
      { id: 'prasad', title: 'Ambaji Trust Mohanthal Prasad', location: 'Suvarna Complex Gate 4', tag: 'Famous Mohanthal', color: '#d1fae5' },
      { id: 'wheelchair', title: 'Paddayatri & Divyang Seva Ramps', location: 'Shakti Dwaar South Corridor', tag: 'Free Wheelchairs', color: '#ede9fe' },
      { id: 'helpdesk', title: 'Banaskantha Police Pilgrim Desk', location: 'Central Security Tower (Gate 1)', tag: 'Officer Station', color: '#dbeafe' }
    ],
    emergencyAgencies: {
      police: 'Banaskantha District Police (Ambaji Station): 112 / 02749-262100',
      ambulance: '108 Ambaji Cottage Trauma Post',
      hospital: 'Ambaji General Hospital & Trauma Center (0.8 km)',
      fire: 'Ambaji Municipal Fire Unit (02749-262101)'
    }
  },

  pavagadh: {
    id: 'pavagadh',
    name: 'Shri Mahakali Dham (Pavagadh Hill)',
    shortName: 'Pavagadh Dham',
    district: 'Panchmahal, Gujarat',
    deity: 'Mata Kalika (Mountain Peak Shaktipeeth)',
    heritage: 'UNESCO World Heritage cliff temple atop 800m volcanic hill with passenger ropeway & 2,000 steps',
    coordinates: { lat: 22.4649, lng: 73.5350 },
    stats: {
      systemStatus: 'Operational',
      currentCrowd: 18600,
      todayVisitors: 342500,
      capacityLimit: 30000,
      capacityUsed: 62,
      entryCount: 20100,
      exitCount: 1500,
      activeZones: { current: 4, total: 8 },
      activeAlertsCount: 0,
      policeDeployed: 20,
      weatherImpact: 'High Elevation Gusts (22°C / 45% Hum)',
      aiConfidence: 96.5,
      lastUpdated: 'Just now'
    },
    bottomMetrics: {
      todayVisitors: 342500,
      visitorsChange: '+26.8%',
      peakTime: '07:00 AM - 11:30 AM (Morning Climb)',
      predictionAccuracy: 96.5,
      accuracyChange: '+2.0%',
      highRiskZones: 2,
      riskZonesChange: '0',
      emergencyAlerts: 0,
      alertsChange: '0',
      avgWaitingTime: 40,
      waitingTimeChange: '-2 mins'
    },
    aartiSchedule: [
      { name: 'Bhor Mangala Aarti', time: '05:30 AM', status: 'COMPLETED' },
      { name: 'Shringar & Dhwaja Puja', time: '08:30 AM', status: 'COMPLETED' },
      { name: 'Sandhya Maha Aarti', time: '06:45 PM', status: 'NEXT AARTI' },
      { name: 'Temple Summit Closing', time: '08:00 PM', status: 'UPCOMING' }
    ],
    queueLanes: [
      { id: 'gate1', name: 'Machi Base Udan Khatola Ropeway', waitMins: 55, density: 'High', rate: 70 },
      { id: 'gate2', name: 'Heritage Stairway (Saat Kaman Path)', waitMins: 40, density: 'Moderate', rate: 90 },
      { id: 'gate3', name: 'Summit Cliff Sanctum Entry Line', waitMins: 28, density: 'Moderate', rate: 100 }
    ],
    landmarks: [
      'Machi Base Camp & Ropeway Station',
      'Saat Kaman Heritage Arch Gate',
      'Dudhala Mahakali Cliff Entrance (Pillar #8)',
      'Teliya Talav Hill Holding Bay',
      'Kalika Mata Summit Altar Platform',
      'Manchi Police Checkpost Sector 1'
    ],
    amenities: [
      { id: 'water', title: 'High-Altitude Mineral Water Kiosks', location: 'Machi Base, Dudhiya Lake & Summit', tag: 'Free 24x7', color: '#e0f2fe' },
      { id: 'shoes', title: 'Hilltop & Machi Footwear Stands', location: 'Machi Base Camp & Upper Terminal', tag: 'Free Token', color: '#fef3c7' },
      { id: 'medical', title: 'Mountain Rescue & Stretcher Squad', location: 'Machi Station & Summit Post', tag: 'Emergency Rescue', color: '#fee2e2' },
      { id: 'prasad', title: 'Maa Kalika Authentic Chhatra Bhog', location: 'Summit Altar Distribution Hall', tag: 'Blessed Prasad', color: '#d1fae5' },
      { id: 'wheelchair', title: 'Passenger Ropeway Priority Boarding', location: 'Machi Terminal Priority Gate', tag: 'Ropeway Seva', color: '#ede9fe' },
      { id: 'helpdesk', title: 'Panchmahal Police Hill Helpdesk', location: 'Machi Base Control Room', tag: 'Officer Station', color: '#dbeafe' }
    ],
    emergencyAgencies: {
      police: 'Panchmahal / Halol Police Division: 112 / 02676-220100',
      ambulance: '108 Mountain Rescue Ambulance Unit',
      hospital: 'Halol Civil Hospital (11.8 km) & Machi Camp',
      fire: 'Halol Fire Station (02676-220101)'
    }
  }
};
