import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { BarChart3, PieChart, Info, MapPin } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function Demographics() {
  const { villageId, language } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDemographics = async () => {
      if (!villageId) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE}/villages/${villageId}/demographics`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch demographic data');
      } finally {
        setLoading(false);
      }
    };
    fetchDemographics();
  }, [villageId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '15px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading village census charts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>{error || 'No demographic data available.'}</p>
      </div>
    );
  }

  // Chart 1: Gender Distribution
  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [data.gender.male, data.gender.female, data.gender.other],
        backgroundColor: ['#0284c7', '#ec4899', '#f59e0b'],
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  // Chart 2: Age Ranges (Horizontal Bar)
  const ageChartData = {
    labels: Object.keys(data.ageGroups),
    datasets: [
      {
        label: 'Residents Count',
        data: Object.values(data.ageGroups),
        backgroundColor: 'rgba(4, 120, 87, 0.75)',
        borderColor: 'var(--primary)',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // Chart 3: Education Level Distribution
  const educationChartData = {
    labels: Object.keys(data.education),
    datasets: [
      {
        data: Object.values(data.education),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 1
      }
    ]
  };

  // Chart 4: Employment & Occupations
  const employmentChartData = {
    labels: Object.keys(data.employment),
    datasets: [
      {
        label: 'Residents Count',
        data: Object.values(data.employment),
        backgroundColor: [
          'rgba(217, 119, 6, 0.75)',
          'rgba(4, 120, 87, 0.75)',
          'rgba(14, 165, 233, 0.75)',
          'rgba(99, 102, 241, 0.75)',
          'rgba(168, 85, 247, 0.75)',
          'rgba(239, 68, 68, 0.75)',
          'rgba(107, 114, 128, 0.75)'
        ],
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  };

  // Chart 5: Housing Distribution
  const housingChartData = {
    labels: ['Occupied Houses', 'Empty/Vacant Houses'],
    datasets: [
      {
        data: [data.housing.occupiedHouses, data.housing.emptyHouses],
        backgroundColor: ['#10b981', '#e2e8f0'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
        <BarChart3 size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
            {language === 'hi' ? 'जनसांख्यिकी और जनगणना डैशबोर्ड' : language === 'hn' ? 'Demographics & Census Dashboard' : 'Village Demographics'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time visual stats based on official registered resident records of Pateri
          </p>
        </div>
      </div>

      {/* Top row cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Population</h4>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)' }}>{data.gender.male + data.gender.female + data.gender.other}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Residents</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Households</h4>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--secondary)' }}>{data.housing.occupiedHouses}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupied Houses</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Literacy Rate</h4>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#3b82f6' }}>
            {Math.round(((data.education.Graduate + data.education.Intermediate + data.education.Matriculation + data.education.Primary) / (data.gender.male + data.gender.female + data.gender.other)) * 100)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Education+</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mandi Farmers Ratio</h4>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981' }}>
            {Math.round((data.employment.Farmer / (data.gender.male + data.gender.female + data.gender.other)) * 100)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Occupation</span>
        </div>
      </div>

      {/* Grid of charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
        
        {/* Gender split */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750', alignSelf: 'flex-start' }}>Gender Split</h3>
          <div style={{ width: '220px', height: '220px' }}>
            <Pie data={genderChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px', fontSize: '0.85rem' }}>
            <div>🔵 Male: <strong>{data.gender.male}</strong></div>
            <div>🔴 Female: <strong>{data.gender.female}</strong></div>
            <div>🟡 Other: <strong>{data.gender.other}</strong></div>
          </div>
        </div>

        {/* Age groups */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750' }}>Age Cohorts</h3>
          <Bar 
            data={ageChartData} 
            options={{ 
              indexAxis: 'y', 
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
            }} 
          />
        </div>

        {/* Education split */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750', alignSelf: 'flex-start' }}>Education Level</h3>
          <div style={{ width: '220px', height: '220px' }}>
            <Doughnut data={educationChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Occupations */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750' }}>Occupations & Employment</h3>
          <Bar 
            data={employmentChartData} 
            options={{ 
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
            }} 
          />
        </div>

        {/* Housing Split */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750', alignSelf: 'flex-start' }}>Housing occupancy ratio</h3>
          <div style={{ width: '220px', height: '220px' }}>
            <Doughnut data={housingChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '0.85rem' }}>
            <div>🟢 Occupied: <strong>{data.housing.occupiedHouses}</strong></div>
            <div>⚪ Empty: <strong>{data.housing.emptyHouses}</strong></div>
          </div>
        </div>

        {/* Blood group stats */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '750' }}>Blood Group Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', marginTop: '10px' }}>
            {Object.entries(data.bloodGroups).map(([bg, count]) => (
              <div key={bg} style={{ background: 'var(--bg-cream)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#e11d48' }}>{bg}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} donors</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="glass-card" style={{ marginTop: '30px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '4px solid var(--primary)' }}>
        <Info size={20} color="var(--primary)" />
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Demographic stats are updated automatically whenever a new birth/death registration is approved by the Gram Panchayat Admin.
        </p>
      </div>

    </div>
  );
}

export default Demographics;
