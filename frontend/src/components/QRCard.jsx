import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

function QRCard({ resident }) {
  if (!resident) return null;

  // Deterministic 21x21 QR Grid based on hashing the Resident ID
  const generateMockQR = (id) => {
    const size = 21;
    const grid = [];
    
    // Hash helper
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Build grid
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        // Render QR finder patterns (corners)
        const isCorner = 
          (r < 7 && c < 7) || // Top-Left
          (r < 7 && c >= 14) || // Top-Right
          (r >= 14 && c < 7); // Bottom-Left
        
        if (isCorner) {
          // Inner outline for corners
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6 || 
                           r === 14 || r === 20 || (c === 0 && r >= 14) || (c === 6 && r >= 14) ||
                           c === 14 || c === 20 || (r === 0 && c >= 14) || (r === 6 && c >= 14);
          const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                           (r >= 2 && r <= 4 && c >= 16 && c <= 18) ||
                           (r >= 16 && r <= 18 && c >= 2 && c <= 4);
          row.push(isBorder || isCenter);
        } else {
          // Deterministic noise for content data
          const val = ((hash >> (r + c)) & 1) === 1;
          row.push(val);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const qrGrid = generateMockQR(resident.residentId);

  return (
    <div className="digital-id-card" style={{ margin: '10px auto' }}>
      
      {/* Heritage Seal overlay */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--accent)', paddingBottom: '6px' }}>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary)', fontWeight: 'bold' }}>
          Gram Panchayat Pateri
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 'bold' }}>
          <Shield size={10} /> VERIFIED RESIDENT
        </div>
      </div>

      <div className="digital-id-body">
        {/* Photo */}
        <div 
          className="digital-id-photo" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '36px', 
            backgroundColor: resident.gender === 'Male' ? '#eff6ff' : '#fdf2f8', 
            color: resident.gender === 'Male' ? '#2563eb' : '#db2777',
            border: `2px solid ${resident.gender === 'Male' ? '#bfdbfe' : '#fbcfe8'}`,
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          {resident.gender === 'Male' ? '♂' : '♀'}
        </div>
        
        {/* Profile Stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
            {resident.name}
          </div>
          <div>ID: <strong>{resident.residentId}</strong></div>
          <div>Father/Husband Name: <strong>{resident.fatherName || 'N/A'}</strong></div>
          <div>Occupation: <strong>{resident.occupation}</strong></div>
          <div>Blood Group: <strong style={{ color: '#dc2626' }}>{resident.bloodGroup}</strong></div>
        </div>
      </div>

      {/* SVG QR Code */}
      <div className="digital-id-qr">
        <svg width="120" height="120" viewBox="0 0 21 21" shapeRendering="crispEdges">
          {qrGrid.map((row, r) => 
            row.map((val, c) => (
              <rect 
                key={`${r}-${c}`} 
                x={c} 
                y={r} 
                width="1" 
                height="1" 
                fill={val ? 'var(--text-dark)' : 'white'} 
              />
            ))
          )}
        </svg>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        Scan QR to verify profile online at digitalpateri.in
      </div>
    </div>
  );
}

export default QRCard;
