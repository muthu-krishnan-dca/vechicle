import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
  IonButton,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
  receiptOutline,
  schoolOutline,
  checkmarkCircle,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RtoExamModal } from '../components/RtoExamModal';
import { ChallanModal } from '../components/ChallanModal';

export const ServicesTab: React.FC = () => {
  const navigate = useNavigate();
  const [showExamModal, setShowExamModal] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);

  const exclusiveServices = [
    {
      id: 'exam',
      title: 'Practice driving exam',
      color: '#3b82f6',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="8" width="28" height="34" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="24" cy="24" r="10" fill="#22c55e" />
          <text x="24" y="28" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">A</text>
        </svg>
      ),
      action: () => setShowExamModal(true),
    },
    {
      id: 'dl_sign',
      title: 'DL Que. & Sign',
      color: '#0ea5e9',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="10" width="32" height="24" rx="6" fill="#38bdf8" />
          <text x="24" y="27" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">?</text>
          <circle cx="16" cy="38" r="2" fill="#38bdf8" />
          <circle cx="22" cy="38" r="2" fill="#38bdf8" />
        </svg>
      ),
      action: () => setShowExamModal(true),
    },
    {
      id: 'driving_school',
      title: 'Driving school',
      color: '#6366f1',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="16" stroke="#475569" strokeWidth="4" />
          <circle cx="24" cy="24" r="6" fill="#475569" />
          <line x1="8" y1="24" x2="18" y2="24" stroke="#475569" strokeWidth="3" />
          <line x1="30" y1="24" x2="40" y2="24" stroke="#475569" strokeWidth="3" />
          <line x1="24" y1="30" x2="24" y2="40" stroke="#475569" strokeWidth="3" />
        </svg>
      ),
      action: () => alert('RTO Certified Driving Schools: 42 certified motor training institutes found nearby.'),
    },
    {
      id: 'traffic_rules',
      title: 'Traffic rules & penal',
      color: '#8b5cf6',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="10" width="24" height="30" rx="3" fill="#3b82f6" />
          <rect x="16" y="14" width="16" height="5" rx="1.5" fill="#fef08a" />
          <line x1="16" y1="24" x2="28" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="29" x2="26" y2="29" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => alert('Motor Vehicles (Amendment) Act 2019: View all offenses and penalties.'),
    },
  ];

  const carServices = [
    { title: 'Car insurance', icon: '🚗', action: () => navigate('/insurance') },
    { title: 'Check car challan', icon: '👮', action: () => setShowChallanModal(true) },
    { title: 'Sell your car', icon: '🔑', action: () => alert('Sell Car: Free doorstep evaluation scheduled.') },
    { title: 'Check car history', icon: '📋', action: () => alert('Car History: Zero accident claim record.') },
    { title: 'Buy used car', icon: '🚙', action: () => alert('Certified Pre-Owned Cars: 140-point inspection.') },
    { title: 'Car check', icon: '🔧', action: () => alert('Comprehensive Health Check: Diagnostic scanner report.') },
    { title: 'FASTag manager', icon: '💳', action: () => alert('FASTag Balance & Recharge active.') },
    { title: 'Cash loan', icon: '💰', action: () => alert('Instant vehicle equity loan up to 80% valuation.') },
  ];

  const bikeServices = [
    { title: 'Bike insurance', icon: '🏍️', action: () => navigate('/insurance') },
    { title: 'Pay bike challan', icon: '🚨', action: () => setShowChallanModal(true) },
    { title: 'Bike resale value', icon: '🪙', action: () => alert('Resale Value Calculator: Orange Book Value algorithm.') },
    { title: 'New bikes', icon: '✨', action: () => navigate('/insurance') },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>
      <IonContent fullscreen style={{ '--background': '#ffffff' }}>
        <div className="app-content-container">
          {/* Section: Exclusive Services (matching Screenshot 5) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
                Exclusive services
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {exclusiveServices.map((s) => (
                <div
                  key={s.id}
                  onClick={s.action}
                  className="white-card"
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                    borderRadius: '18px',
                    padding: '18px 16px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    border: 'none',
                    margin: 0,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, maxWidth: '90%' }}>
                    {s.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Other Services */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                Other services
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {[
                { title: 'Resale value', icon: '💰', action: () => alert('Vehicle Valuation: Market appraisal based on city, year, and condition.') },
                { title: 'RTO office', icon: '🏢', action: () => alert('Find RTO Office: Timings, forms, and jurisdiction directory.') },
                { title: 'Traffic rules & penalty', icon: '🚦', action: () => alert('Traffic Violations & Penalties under Motor Vehicles Act.') },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  className="white-card"
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '20px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.25 }}>{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Get Car Service Report Banner (matching Screenshot 5) */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 70%, #38bdf8 100%)',
                color: '#ffffff',
                borderRadius: '20px',
                padding: '22px 28px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.3)',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 800 }}>
                  Get car service report
                </h4>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#dbeafe', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1.1rem' }} /> Kilometer reading
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1.1rem' }} /> Accident history
                  </span>
                </div>
              </div>
              <button
                onClick={() => alert('Vehicle Inspection Report: Downloaded successfully.')}
                style={{
                  background: '#ffffff',
                  color: '#1d4ed8',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '10px 24px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.15s ease',
                }}
              >
                Get report
              </button>
            </div>
          </div>

          {/* Section: Cars Categories (matching Screenshot 5) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Cars
              </h4>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px 10px' }}>
              {carServices.map((c, i) => (
                <div key={i} className="feature-item" onClick={c.action}>
                  <div className="feature-icon-circle">
                    <span style={{ fontSize: '1.6rem' }}>{c.icon}</span>
                  </div>
                  <span className="feature-label">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Two Wheelers Categories (matching Screenshot 5) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Two wheelers
              </h4>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px 10px' }}>
              {bikeServices.map((b, i) => (
                <div key={i} className="feature-item" onClick={b.action}>
                  <div className="feature-icon-circle">
                    <span style={{ fontSize: '1.6rem' }}>{b.icon}</span>
                  </div>
                  <span className="feature-label">{b.title}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Bottom Branding (matching Screenshot 5) */}
          <div style={{ textAlign: 'center', padding: '24px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
              Vehicle Info
            </div>
            <h3 style={{ margin: '4px 0 12px 0', fontSize: '1.3rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.02em', fontFamily: 'Outfit' }}>
              ALL-IN-ONE<br />VEHICLE SOLUTION
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="100" height="50" viewBox="0 0 120 60" fill="none">
                <path d="M20 50C20 25 40 10 60 10C80 10 100 25 100 50H20Z" fill="#cbd5e1" />
                <path d="M35 50C35 32 46 20 60 20C74 20 85 32 85 50H35Z" fill="#94a3b8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <Footer />

        {/* Practice Driving Exam Simulator Modal */}
        <RtoExamModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
        />

        {/* Challan Modal */}
        <ChallanModal
          isOpen={showChallanModal}
          onClose={() => setShowChallanModal(false)}
          regNo="MH01AE8055"
        />
      </IonContent>
    </IonPage>
  );
};
