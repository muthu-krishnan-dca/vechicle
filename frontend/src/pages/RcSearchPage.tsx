import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import {
  checkmarkCircle,
  alertCircleOutline,
} from 'ionicons/icons';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RcDetailsModal } from '../components/RcDetailsModal';
import { api, VehicleRecord } from '../services/api';

export const RcSearchPage: React.FC = () => {
  const [regNo, setRegNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [showRcModal, setShowRcModal] = useState(false);
  const [modalPlate, setModalPlate] = useState('MH01AE8055');
  const [errorMsg, setErrorMsg] = useState('');

  const samplePlates = [
    { plate: 'MH01AE8055', label: 'Hunter 350' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15' },
    { plate: 'TN09AZ4321', label: 'Activa 6G' },
    { plate: 'KA05MH9999', label: 'KTM 390 Duke' },
    { plate: 'UP32BK7711', label: 'Splendor Plus' },
  ];

  const handleSearch = async (plateToSearch?: string) => {
    const rawPlate = (plateToSearch || regNo).trim();
    const cleanPlate = rawPlate.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) {
      setErrorMsg('Please enter a valid vehicle registration number');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setModalPlate(cleanPlate);

    try {
      const v = await api.getVehicleRC(cleanPlate);
      setSelectedVehicle(v);
      setShowRcModal(true);
    } catch (err: any) {
      console.error('RC search failed:', err);
      setErrorMsg(`Vehicle records for "${cleanPlate}" not found in database. Try sample: MH01AE8055`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPlate = (plate: string) => {
    setRegNo(plate);
    handleSearch(plate);
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>

          {/* Hero Banner with White & Yellow radiant shade */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fffdf0 25%, #fef9c3 55%, #fef08a 85%, #fde047 100%)',
              borderRadius: '24px',
              padding: '48px 40px',
              color: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid #fde047',
              boxShadow: '0 16px 36px -10px rgba(234, 179, 8, 0.22)',
            }}
          >
            {/* Background Watermark Vehicle Silhouette */}
            <div
              style={{
                position: 'absolute',
                right: '25%',
                bottom: '-20px',
                opacity: 0.12,
                pointerEvents: 'none',
              }}
            >
              <svg width="420" height="240" viewBox="0 0 24 24" fill="#ca8a04">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>

            {/* Left Column: Heading & Features Checklist */}
            <div style={{ flex: '1 1 480px', zIndex: 2 }}>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  lineHeight: 1.18,
                  margin: '0 0 24px 0',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Check Vehicle RC Details Online by Registration Number
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '1px solid #fde047',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#854d0e',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(202, 138, 4, 0.15)',
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#334155' }}>
                    Vehicle Ownership Details Online
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '1px solid #fde047',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#854d0e',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(202, 138, 4, 0.15)',
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#334155' }}>
                    RTO Information from RC Number
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '1px solid #fde047',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#854d0e',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(202, 138, 4, 0.15)',
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#334155' }}>
                    Insurance Details & PUC Status
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: White Card matching Screenshot 1 */}
            <div
              style={{
                flex: '0 0 380px',
                maxWidth: '100%',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '32px 28px',
                boxShadow: '0 20px 40px -15px rgba(202, 138, 4, 0.16), 0 8px 24px rgba(0,0,0,0.06)',
                border: '1.5px solid #fef08a',
                color: '#0f172a',
                zIndex: 2,
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  margin: '0 0 20px 0',
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                Enter Vehicle Number
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                {/* Input with IND badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '6px',
                    background: '#ffffff',
                    marginBottom: '18px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* IND Flag Badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      borderRight: '1.5px solid #e2e8f0',
                      marginRight: '10px',
                    }}
                  >
                    {/* Small Chakra */}
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '1.5px solid #2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2px',
                      }}
                    >
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563eb' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.05em' }}>
                      IND
                    </span>
                  </div>

                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => {
                      setRegNo(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    placeholder="GJ00XX0000"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontFamily: 'Outfit, monospace',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                {/* Error message if any */}
                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                {/* CHECK RC INFORMATION Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {loading ? (
                    <IonSpinner name="crescent" style={{ color: '#ffffff', width: '20px', height: '20px' }} />
                  ) : (
                    'CHECK RC INFORMATION'
                  )}
                </button>
              </form>

              {/* Trusted by 10CR+ Indians */}
              <div
                style={{
                  marginTop: '18px',
                  textAlign: 'center',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Trusted by</span>
                <strong style={{ color: '#0f172a' }}>10CR+</strong>
                <span>Indians</span>
                <span>🇮🇳</span>
              </div>
            </div>
          </div>



          {/* Section: What is RC (Registration Certificate)? matching Screenshot 1 */}
          <section style={{ marginTop: '48px' }}>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                color: '#0f172a',
                marginBottom: '16px',
              }}
            >
              What is RC (Registration Certificate)?
            </h2>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                lineHeight: 1.7,
                color: '#334155',
                fontSize: '0.98rem',
              }}
            >
              <p style={{ margin: '0 0 16px 0' }}>
                A <strong>Registration Certificate (RC)</strong> is an official document issued by the Regional Transport Office (RTO) that proves that your motor vehicle is registered with the Indian Government. Under the Motor Vehicles Act of 1988, it is legally mandatory for all motor vehicles operating on Indian roads to possess a valid Registration Certificate.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginTop: '24px',
                }}
              >
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e40af' }}>
                    📋 Key Details Found on RC
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#475569' }}>
                    <li>Vehicle Registration Number & Registration Date</li>
                    <li>Owner's Name and Masked Address</li>
                    <li>Maker, Model, and Vehicle Class</li>
                    <li>Engine Capacity (CC) & Fuel Type</li>
                    <li>Chassis & Engine Numbers</li>
                    <li>Fitness Expiration Date & RTO Office</li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e40af' }}>
                    🛡️ Why Verify RC Online?
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#475569' }}>
                    <li>Check genuine ownership before buying a used vehicle</li>
                    <li>Verify active insurance and PUC validity</li>
                    <li>Check pending traffic e-challans and fines</li>
                    <li>Ensure vehicle is not blacklisted or reported stolen</li>
                    <li>Confirm engine and chassis numbers match the physical vehicle</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section: How to Check Vehicle RC Online */}
          <section style={{ marginTop: '40px' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                color: '#0f172a',
                marginBottom: '16px',
              }}
            >
              Steps to Check Vehicle RC Details Online
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {[
                { step: '01', title: 'Enter Vehicle Number', desc: 'Type your two-wheeler or four-wheeler license plate number into the search box above.' },
                { step: '02', title: 'Instant Vahan Lookup', desc: 'Our portal connects directly to the Parivahan Vahan registry database to pull authenticated records.' },
                { step: '03', title: 'Review Vehicle Specs', desc: 'Instantly view masked owner name, registration date, fitness status, and fuel specifications.' },
                { step: '04', title: 'Check Insurance & Fines', desc: 'Ensure active insurance policy coverage and check for any outstanding traffic challans.' },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    {s.step}
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {s.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RC Details Modal */}
        <RcDetailsModal
          isOpen={showRcModal}
          onClose={() => setShowRcModal(false)}
          vehicle={selectedVehicle}
        />

        <Footer />
      </IonContent>
    </IonPage>
  );
};
