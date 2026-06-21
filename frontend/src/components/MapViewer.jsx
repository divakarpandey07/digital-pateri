import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Map as MapIcon, Filter, Store, AlertTriangle, Hammer, Users, Home } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function MapViewer() {
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' or 'street'
  // Active Layer Toggles
  const [layers, setLayers] = useState({
    complaints: true,
    assets: true,
    businesses: true,
    volunteers: true,
    houses: true
  });

  const { complaints, villageId } = useStore();
  const [assets, setAssets] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [houses, setHouses] = useState([]);

  // Coordinates centering Pateri village (Bihar centroid)
  const position = [25.0210, 83.5684];

  // Mohalla centroid mapping for positioning residents/volunteers
  const mohallaCoordinates = {
    'Purab Tola': [25.0215, 83.5691],
    'Dalit Basti': [25.0201, 83.5672],
    'Dada Patti': [25.0203, 83.5675],
    'Market Area': [25.0210, 83.5684],
    'Pipra Tola': [25.0225, 83.5681]
  };

  useEffect(() => {
    fetchMapLayersData();
  }, [villageId]);

  const fetchMapLayersData = async () => {
    if (!villageId) return;

    // 1. Fetch Assets
    try {
      const assetsRes = await axios.get(`${API_BASE}/villages/${villageId}/assets`);
      setAssets(assetsRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }

    // 2. Fetch Businesses
    try {
      const bizRes = await axios.get(`${API_BASE}/marketplace/businesses`, {
        params: { villageId, verifiedOnly: true }
      });
      setBusinesses(bizRes.data?.data?.records || []);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    }

    // 3. Fetch Volunteers
    try {
      const volRes = await axios.get(`${API_BASE}/volunteers`, {
        params: { villageId }
      });
      setVolunteers(volRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    }

    // 4. Fetch Houses Map Data
    try {
      const housesRes = await axios.get(`${API_BASE}/residents/houses`);
      setHouses(housesRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching houses:', err);
    }
  };

  // Color mapping by complaint category
  const getComplaintColor = (category) => {
    switch (category) {
      case 'Water': return '#2563eb'; // Blue
      case 'Electricity': return '#d97706'; // Saffron
      case 'Road': return '#b91c1c'; // Red
      case 'Sanitation': return '#059669'; // Green
      default: return '#7c3aed'; // Purple
    }
  };

  const toggleLayer = (layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  return (
    <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-serif)' }}>
          <MapIcon size={20} color="var(--primary)" /> Pateri Village Map
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => setMapMode('satellite')} 
            className="filter-chip"
            style={{ 
              fontSize: '0.75rem', 
              padding: '5px 12px', 
              background: mapMode === 'satellite' ? 'var(--primary)' : 'white',
              color: mapMode === 'satellite' ? 'white' : 'var(--text-dark)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: mapMode === 'satellite' ? '0 2px 4px rgba(4,120,87,0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🛰️ Satellite
          </button>
          <button 
            onClick={() => setMapMode('street')} 
            className="filter-chip"
            style={{ 
              fontSize: '0.75rem', 
              padding: '5px 12px', 
              background: mapMode === 'street' ? 'var(--primary)' : 'white',
              color: mapMode === 'street' ? 'white' : 'var(--text-dark)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: mapMode === 'street' ? '0 2px 4px rgba(4,120,87,0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🗺️ Vector Map
          </button>
        </div>
      </div>

      {/* Layer Filter Toggles */}
      <div className="card" style={{ padding: '10px', marginBottom: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={14} /> Map Layers:
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={layers.complaints} onChange={() => toggleLayer('complaints')} />
          <AlertTriangle size={14} style={{ color: 'var(--danger)' }} /> Complaints
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={layers.assets} onChange={() => toggleLayer('assets')} />
          <Hammer size={14} style={{ color: '#d97706' }} /> Village Assets
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={layers.businesses} onChange={() => toggleLayer('businesses')} />
          <Store size={14} style={{ color: '#16a34a' }} /> Shops & Businesses
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={layers.volunteers} onChange={() => toggleLayer('volunteers')} />
          <Users size={14} style={{ color: '#7c3aed' }} /> Volunteers
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={layers.houses} onChange={() => toggleLayer('houses')} />
          <Home size={14} style={{ color: '#1d4ed8' }} /> Registered Houses
        </label>
      </div>
      
      {/* Leaflet OpenStreetMap Map */}
      <div style={{ height: '380px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          {mapMode === 'satellite' ? (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          )}

          {/* 1. Complaints Layer */}
          {layers.complaints && complaints.filter(c => c.latitude && c.longitude).map(complaint => (
            <CircleMarker 
              key={`complaint-${complaint._id}`}
              center={[complaint.latitude, complaint.longitude]} 
              radius={10}
              pathOptions={{
                fillColor: getComplaintColor(complaint.category),
                color: '#ffffff',
                fillOpacity: 0.8,
                weight: 1.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--danger)' }}>🚨 Complaint [{complaint.category}]</strong>
                  <div style={{ fontWeight: 'bold', margin: '4px 0' }}>{complaint.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority: {complaint.priority} | Status: {complaint.status}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 2. Village Assets Layer */}
          {layers.assets && assets.filter(a => a.latitude && a.longitude).map(asset => (
            <CircleMarker 
              key={`asset-${asset._id}`}
              center={[asset.latitude, asset.longitude]} 
              radius={10}
              pathOptions={{
                fillColor: '#d97706', // Saffron
                color: '#ffffff',
                fillOpacity: 0.8,
                weight: 1.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#d97706' }}>🔧 Village Asset [{asset.type}]</strong>
                  <div style={{ fontWeight: 'bold', margin: '4px 0' }}>{asset.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {asset.location} | Condition: {asset.condition}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 3. Shops & Businesses Layer */}
          {layers.businesses && businesses.filter(b => b.latitude && b.longitude).map(biz => (
            <CircleMarker 
              key={`biz-${biz._id}`}
              center={[biz.latitude, biz.longitude]} 
              radius={10}
              pathOptions={{
                fillColor: '#16a34a', // Active Green
                color: '#ffffff',
                fillOpacity: 0.8,
                weight: 1.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#16a34a' }}>🛍️ Store [{biz.category}]</strong>
                  <div style={{ fontWeight: 'bold', margin: '4px 0' }}>{biz.businessName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact: +91 {biz.contactMobile} | Rating: {biz.averageRating}★</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 4. Volunteers Layer (Aggregated by Mohalla with small jitter) */}
          {layers.volunteers && volunteers.map((vol, index) => {
            const mohalla = vol.residentId?.mohalla;
            const coords = mohallaCoordinates[mohalla];
            if (!coords) return null;

            // Introduce small Jitter/offset so markers don't overlap completely
            const jitterLat = coords[0] + (Math.sin(index) * 0.00015);
            const jitterLng = coords[1] + (Math.cos(index) * 0.00015);

            return (
              <CircleMarker 
                key={`volunteer-${vol._id}`}
                center={[jitterLat, jitterLng]} 
                radius={10}
                pathOptions={{
                  fillColor: '#7c3aed', // Purple
                  color: '#ffffff',
                  fillOpacity: 0.8,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: '#7c3aed' }}>🤝 Volunteer [{vol.category}]</strong>
                    <div style={{ fontWeight: 'bold', margin: '4px 0' }}>{vol.residentId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skills: {vol.skills.join(', ')} | Availability: {vol.availability}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
          {/* 5. Registered Houses Layer */}
          {layers.houses && houses.map(house => (
            <CircleMarker 
              key={`house-${house.houseNo}`}
              center={[house.latitude, house.longitude]} 
              radius={8}
              pathOptions={{
                fillColor: '#1d4ed8', // Sapphire Blue
                color: '#ffffff',
                fillOpacity: 0.85,
                weight: 1.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#1d4ed8' }}>🏠 House No: {house.houseNo}</strong>
                  <div style={{ margin: '4px 0' }}><strong>Head of Family:</strong> {house.headOfFamily}</div>
                  <div><strong>Occupants:</strong> {house.residentsCount} residents</div>
                  <div><strong>Ward:</strong> {house.ward}</div>
                  <div><strong>Verification Status:</strong> {house.verifiedResidents} / {house.residentsCount} verified</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}

export default MapViewer;
