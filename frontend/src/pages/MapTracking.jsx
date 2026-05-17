import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';
import L from 'leaflet';
import { AuthContext } from '../contexts/AuthContext';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapTracking = () => {
  const [locations, setLocations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLocations = () => {
    api.get('/location').then(res => setLocations(res.data));
  };

  const center = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [-6.200000, 106.816666]; // Default to Jakarta

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Monitoring Lokasi Pegawai</h2>
      <div className="card" style={{ height: '600px', padding: 0, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {locations.map(loc => {
            const isOnline = new Date() - new Date(loc.lastActive) < 60000 * 5; // online if active within 5 mins
            return (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <strong>{loc.name}</strong><br />
                  {loc.role?.name}<br />
                  {loc.direktorat?.name}<br />
                  Status: <span style={{ color: isOnline ? 'green' : 'red' }}>{isOnline ? 'Online' : 'Offline'}</span><br />
                  Terakhir Update: {new Date(loc.lastActive).toLocaleTimeString()}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapTracking;
