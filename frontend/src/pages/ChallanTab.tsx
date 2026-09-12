import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import {
  searchOutline,
  receiptOutline,
  checkmarkDoneCircleOutline,
  alertCircleOutline,
  walletOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { Header } from '../components/Header';
import { ChallanCard } from '../components/ChallanCard';
import { api, ChallanRecord } from '../services/api';

export const ChallanTab: React.FC = () => {
  const [regNo, setRegNo] = useState('MH01AE8055');
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const fetchChallans = async (plate: string) => {
    setLoading(true);
    try {
      const data = await api.getChallans(plate);
      setChallans(data);
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans('MH01AE8055');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChallans(regNo);
  };

  const handleChallanPaid = (updated: ChallanRecord) => {
    setChallans((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const pendingList = challans.filter((c) => c.status === 'PENDING');
  const paidList = challans.filter((c) => c.status === 'PAID');

  const pendingTotal = pendingList.reduce((sum, c) => sum + Number(c.fine_amount), 0);
  const paidTotal = paidList.reduce((sum, c) => sum + Number(c.fine_amount), 0);

  const displayedChallans = challans.filter((c) => {
    if (filter === 'pending') return c.status === 'PENDING';
    if (filter === 'paid') return c.status === 'PAID';
    return true;
  });

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#090d16' }}>
        <div className="app-container">
          {/* Header Search Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '24px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '8px' }}>
              <IonIcon icon={receiptOutline} style={{ color: '#f87171', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>Traffic Police E-Challan System</span>
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              Traffic E-Challan & Online Settlement
            </h1>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Verify electronic traffic police violation notices across Indian states and settle pending fines instantly via secure DRF PUT settlement.
            </p>

            {/* Vehicle Search Form */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '580px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                  placeholder="Enter Vehicle Registration (e.g. MH01AE8055)"
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1.5px solid rgba(6, 182, 212, 0.4)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontFamily: 'Outfit, monospace',
                    fontWeight: 700,
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>

              <IonButton
                type="submit"
                disabled={loading}
                style={{
                  '--background': '#06b6d4',
                  '--color': '#ffffff',
                  '--border-radius': '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  height: '46px',
                  minWidth: '140px',
                }}
              >
                {loading ? <IonSpinner name="dots" /> : (
                  <>
                    <IonIcon icon={searchOutline} slot="start" />
                    Fetch Challans
                  </>
                )}
              </IonButton>
            </form>

            {/* Quick Sample Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quick Plate Search:</span>
              {['MH01AE8055', 'DL01AB1234', 'TN09AZ4321', 'KA05MH9999', 'UP32BK7711'].map((plate) => (
                <button
                  key={plate}
                  type="button"
                  className="quick-chip"
                  onClick={() => {
                    setRegNo(plate);
                    fetchChallans(plate);
                  }}
                  style={{
                    borderColor: regNo === plate ? '#06b6d4' : undefined,
                    color: regNo === plate ? '#38bdf8' : undefined,
                  }}
                >
                  {plate}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Summary Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pending Fines Due</span>
                <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', fontFamily: 'Outfit', margin: '4px 0 2px 0' }}>
                ₹{pendingTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
                {pendingList.length} unpaid violation notices
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Settled Fines</span>
                <IonIcon icon={checkmarkDoneCircleOutline} style={{ color: '#10b981', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit', margin: '4px 0 2px 0' }}>
                ₹{paidTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>
                {paidList.length} penalties cleared with receipts
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 18px', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vehicle Registration</span>
                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#06b6d4', fontSize: '1.4rem' }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit', margin: '6px 0 2px 0' }}>
                {regNo || 'ALL'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                Parivahan E-Challan Portal Active
              </div>
            </div>
          </div>

          {/* Filter Segment Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <IonSegment
              value={filter}
              onIonChange={(e) => setFilter(e.detail.value as any)}
              style={{ maxWidth: '380px' }}
            >
              <IonSegmentButton value="all">
                <IonLabel>All ({challans.length})</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pending">
                <IonLabel>Pending ({pendingList.length})</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="paid">
                <IonLabel>Settled ({paidList.length})</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Showing {displayedChallans.length} records
            </span>
          </div>

          {/* Challans List */}
          <div>
            {displayedChallans.length === 0 ? (
              <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
                <IonIcon icon={checkmarkDoneCircleOutline} style={{ fontSize: '3.5rem', color: '#10b981', marginBottom: '10px' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  No Traffic Violations Found!
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Vehicle {regNo} has clean driving records in this category. Safe riding!
                </p>
              </div>
            ) : (
              displayedChallans.map((challan) => (
                <ChallanCard
                  key={challan.id}
                  challan={challan}
                  onPaid={handleChallanPaid}
                />
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
