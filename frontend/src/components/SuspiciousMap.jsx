import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon missing in Vite/Webpack
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SuspiciousMap = ({ logs }) => {
  // Filter logs that actually have coordinates
  const validLogs = logs.filter(log => log.location?.latitude && log.location?.longitude);

  // Default center (e.g., India or 0,0) if no logs exist
  const defaultCenter = [20.5937, 78.9629]; 
  const center = validLogs.length > 0 
    ? [validLogs[0].location.latitude, validLogs[0].location.longitude] 
    : defaultCenter;

  return (
    <div className="card" style={{ height: '400px', overflow: 'hidden' }}>
      <div className="card-header">
        <h2><i className="fas fa-globe-asia"></i> Threat Map</h2>
      </div>
      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validLogs.map((log) => (
          <Marker 
            key={log._id} 
            position={[log.location.latitude, log.location.longitude]}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong>{log.userId?.name || 'Unknown User'}</strong><br/>
                <span className="text-danger">{log.suspicionReason}</span><br/>
                <small>{log.ipAddress}</small><br/>
                <small>{new Date(log.timestamp).toLocaleString()}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SuspiciousMap;