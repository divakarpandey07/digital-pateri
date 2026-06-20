import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Briefcase, MapPin, DollarSign, Calendar, Info } from 'lucide-react';
import { translations } from '../utils/translations';

function Jobs() {
  const { jobs, fetchJobs, isLoading, villageId, language } = useStore();

  useEffect(() => {
    if (villageId) {
      fetchJobs();
    }
  }, [villageId]);

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
        <Briefcase size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{translations[language]?.jobs_title || 'Pateri Employment Hub'}</h1>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>{language === 'hi' ? 'नौकरियां लोड की जा रही हैं...' : language === 'hn' ? 'Jobs load ho rahi hain...' : 'Loading job postings...'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {jobs.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <Info size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>{translations[language]?.jobs_no_jobs || 'No active job openings currently.'}</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{job.title}</h3>
                  <span style={{ background: 'var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
                    {job.type}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', flex: 1 }}>{job.description}</p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} /> {job.location || 'Pateri Panchayat'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={12} /> {job.salary || 'Competitive / Government rates'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {language === 'hi' ? 'पोस्ट किया गया:' : language === 'hn' ? 'Posted:' : 'Posted:'} {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', marginTop: '5px' }}>
                  {language === 'hi' ? 'आवेदन करें (प्रोफ़ाइल सबमिट करें)' : language === 'hn' ? 'Apply karein (Submit Profile)' : 'Apply Now (Submit Profile)'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default Jobs;
