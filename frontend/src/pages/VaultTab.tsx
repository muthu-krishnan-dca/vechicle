import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  documentLockOutline,
  searchOutline,
  shieldCheckmarkOutline,
  downloadOutline,
  addCircleOutline,
  folderOpenOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { PolicyCard } from '../components/PolicyCard';
import { api, PolicyRecord } from '../services/api';

export const VaultTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.getVaultPolicies(undefined, query);
      setPolicies(data);
    } catch (err) {
      console.error('Failed to fetch policies from vault:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPolicies(searchQuery);
  };

  const activeCount = policies.filter((p) => new Date(p.end_date) >= new Date()).length;
  const totalIDV = policies.reduce((sum, p) => sum + Number(p.idv_amount), 0);

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#090d16' }}>
        <div className="app-container">
          {/* Header Vault Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '24px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '8px' }}>
              <IonIcon icon={documentLockOutline} style={{ color: '#818cf8', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>DigiLocker & IRDAI Integrated Policy Vault</span>
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              Digital Policy Vault & Document History
            </h1>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Access all your purchased two-wheeler motor insurance policies. View digital certificate schedules and re-download official IRDAI Form 51 PDFs anytime.
            </p>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '580px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Vehicle Number or Policy ID..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              <IonButton
                type="submit"
                disabled={loading}
                style={{
                  '--background': '#6366f1',
                  '--color': '#ffffff',
                  '--border-radius': '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  height: '46px',
                  minWidth: '130px',
                }}
              >
                {loading ? <IonSpinner name="dots" /> : (
                  <>
                    <IonIcon icon={searchOutline} slot="start" />
                    Filter Vault
                  </>
                )}
              </IonButton>
            </form>
          </div>

          {/* 3 Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Active Policies</span>
                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#10b981', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit', margin: '4px 0 2px 0' }}>
                {activeCount} Active
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>
                Total {policies.length} stored policies in database
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Insured Value (IDV)</span>
                <IonIcon icon={folderOpenOutline} style={{ color: '#06b6d4', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Outfit', margin: '4px 0 2px 0' }}>
                ₹{totalIDV.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7dd3fc' }}>
                Combined two-wheeler coverage limit
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Instant Certificate</span>
                <IonIcon icon={downloadOutline} style={{ color: '#818cf8', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit', margin: '6px 0 2px 0' }}>
                jsPDF Enabled
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>
                Official CMVR Form 51 format
              </div>
            </div>
          </div>

          {/* List Header & CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
              Stored Policy Documents ({policies.length})
            </h2>

            <IonButton
              onClick={() => navigate('/tab1')}
              style={{
                '--background': '#06b6d4',
                '--color': '#ffffff',
                '--border-radius': '8px',
                height: '38px',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <IonIcon icon={addCircleOutline} slot="start" />
              Buy New Policy
            </IonButton>
          </div>

          {/* Policies Cards */}
          <div>
            {policies.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                <IonIcon icon={folderOpenOutline} style={{ fontSize: '3.5rem', color: '#64748b', marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  No Policies Found in Vault
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Purchase an instant policy using our comparison engine to store digital certificates here.
                </p>
                <IonButton onClick={() => navigate('/tab1')} style={{ '--background': '#06b6d4', '--border-radius': '8px' }}>
                  Compare Quotes Now
                </IonButton>
              </div>
            ) : (
              policies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} />
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
