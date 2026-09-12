import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonBadge,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  searchOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  warningOutline,
  documentTextOutline,
  calendarOutline,
  locationOutline,
  speedometerOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { api, VehicleRecord } from '../services/api';

export const RcStatusTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchReg, setSearchReg] = useState('MH01AE8055');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchVehicle = async (plate: string) => {
    if (!plate.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getVehicleRC(plate);
      setVehicle(data);
    } catch (err) {
      console.error('Failed to fetch RC details:', err);
      setErrorMsg('Vehicle registration details not found in Parivahan database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle('MH01AE8055');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicle(searchReg);
  };

  const getStatusPillClass = (status: string) => {
    if (status === 'ACTIVE') return 'active';
    if (status === 'EXPIRING_SOON') return 'expiring';
    return 'expired';
  };

  const samplePlates = [
    { plate: 'MH01AE8055', label: 'Hunter 350' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15' },
    { plate: 'TN09AZ4321', label: 'Activa 6G' },
    { plate: 'KA05MH9999', label: 'KTM 390 Duke' },
    { plate: 'UP32BK7711', label: 'Splendor Plus' },
  ];

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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '8px' }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#22d3ee', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee' }}>Ministry of Road Transport & Highways (MoRTH)</span>
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              Parivahan Vahan RC Verification
            </h1>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Check real-time registration certificate (RC) status, masked owner details, engine specs, fitness expiry, and insurance validity status.
            </p>

            {/* Registration Input Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '580px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <input
                  type="text"
                  value={searchReg}
                  onChange={(e) => setSearchReg(e.target.value.toUpperCase())}
                  placeholder="Enter Bike Number (e.g. MH01AE8055)"
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
                    letterSpacing: '0.05em',
                    outline: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  }}
                />
              </div>

              <IonButton
                type="submit"
                disabled={loading}
                style={{
                  '--background': '#06b6d4',
                  '--background-hover': '#0891b2',
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
                    Verify RC
                  </>
                )}
              </IonButton>
            </form>

            {/* Quick Plates Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Try Popular Bikes:</span>
              {samplePlates.map((s) => (
                <button
                  key={s.plate}
                  type="button"
                  className="quick-chip"
                  onClick={() => {
                    setSearchReg(s.plate);
                    fetchVehicle(s.plate);
                  }}
                  style={{
                    borderColor: searchReg === s.plate ? '#06b6d4' : undefined,
                    color: searchReg === s.plate ? '#38bdf8' : undefined,
                  }}
                >
                  {s.plate} ({s.label})
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IonIcon icon={warningOutline} style={{ fontSize: '1.4rem', color: '#ef4444' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vehicle Details Result Card */}
          {vehicle && (
            <div>
              {/* RC Summary Main Card */}
              <div className="glass-card" style={{ padding: '24px 22px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span className="number-plate">{vehicle.registration_number}</span>
                      <div className={`status-pill ${getStatusPillClass(vehicle.insurance_status)}`}>
                        <div className="status-dot" />
                        <span>Insurance: {vehicle.insurance_status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
                      {vehicle.maker_model}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Registered with: <strong style={{ color: '#cbd5e1' }}>{vehicle.rto_office}</strong>
                    </div>
                  </div>

                  {/* Fast Action CTA */}
                  <IonButton
                    onClick={() => navigate('/tab1')}
                    style={{
                      '--background': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                      '--color': '#ffffff',
                      '--border-radius': '10px',
                      fontWeight: 700,
                      height: '42px',
                    }}
                  >
                    Compare Quotes for this Bike
                    <IonIcon icon={arrowForwardOutline} slot="end" />
                  </IonButton>
                </div>

                {/* 6-Grid Detailed Specifications */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Masked Owner Name</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{vehicle.masked_owner}</span>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Engine Capacity</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>{vehicle.engine_capacity_cc} CC</span>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Fuel Type & Class</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>{vehicle.fuel_type} ({vehicle.vehicle_class})</span>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Registration Date</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1' }}>{vehicle.registration_date}</span>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Fitness Valid Upto</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>{vehicle.fitness_upto}</span>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Insurance Valid Upto</span>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: vehicle.insurance_status === 'ACTIVE' ? '#10b981' : (vehicle.insurance_status === 'EXPIRING_SOON' ? '#f59e0b' : '#ef4444'),
                      }}
                    >
                      {vehicle.insurance_upto}
                    </span>
                  </div>
                </div>

                {/* Masked Chassis & Engine */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div>Chassis No: <strong style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{vehicle.chassis_number_masked}</strong></div>
                  <div>Engine No: <strong style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{vehicle.engine_number_masked}</strong></div>
                  <div>PUCC Expiry: <strong style={{ color: '#cbd5e1' }}>{vehicle.pucc_upto || 'Valid'}</strong></div>
                  <div>RC Status: <strong style={{ color: '#10b981' }}>{vehicle.status}</strong></div>
                </div>
              </div>

              {/* Pending Challan Alert Card */}
              {vehicle.pending_challans_count > 0 && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '2.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>
                        {vehicle.pending_challans_count} Pending Traffic Violation Fines Found
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                        Total outstanding penalty: <strong>₹{vehicle.pending_fines_total.toLocaleString('en-IN')}</strong>. Clear fines to avoid RC suspension.
                      </div>
                    </div>
                  </div>

                  <IonButton
                    onClick={() => navigate('/tab3')}
                    style={{
                      '--background': '#ef4444',
                      '--color': '#ffffff',
                      '--border-radius': '8px',
                      fontWeight: 700,
                    }}
                  >
                    View & Settle Challans
                  </IonButton>
                </div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
