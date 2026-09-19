import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
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
import { RtoOfficeModal } from '../components/RtoOfficeModal';
import { ResaleValueModal } from '../components/ResaleValueModal';
import { TrafficRulesModal } from '../components/TrafficRulesModal';

export const ServicesTab: React.FC = () => {
  const navigate = useNavigate();
  const [showExamModal, setShowExamModal] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [showRtoOfficeModal, setShowRtoOfficeModal] = useState(false);
  const [showResaleModal, setShowResaleModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const exclusiveServices = [
    {
      id: 'exam',
      title: 'Practice driving exam',
      subtitle: '2026 RTO learner license mock test',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="8" width="28" height="34" rx="6" fill="#ffffff" />
          <circle cx="24" cy="24" r="10" fill="#22c55e" />
          <text x="24" y="28.5" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="Outfit, sans-serif">A</text>
        </svg>
      ),
      action: () => setShowExamModal(true),
    },
    {
      id: 'dl_sign',
      title: 'DL Que. & Road Sign',
      subtitle: 'Official traffic regulatory symbols',
      color: '#0284c7',
      gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="10" width="32" height="24" rx="8" fill="#ffffff" />
          <circle cx="24" cy="22" r="7" fill="#0284c7" />
          <text x="24" y="26" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">?</text>
          <circle cx="16" cy="38" r="2.5" fill="#ffffff" opacity="0.8" />
          <circle cx="22" cy="38" r="2.5" fill="#ffffff" opacity="0.8" />
        </svg>
      ),
      action: () => setShowExamModal(true),
    },
    {
      id: 'driving_school',
      title: 'Driving school directory',
      subtitle: 'Certified motor training institutes',
      color: '#4f46e5',
      gradient: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="16" stroke="#ffffff" strokeWidth="4" />
          <circle cx="24" cy="24" r="6" fill="#ffffff" />
          <line x1="8" y1="24" x2="18" y2="24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="24" x2="40" y2="24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="30" x2="24" y2="40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      action: () => setShowRtoOfficeModal(true),
    },
    {
      id: 'traffic_rules',
      title: 'Traffic rules & penalty',
      subtitle: 'Motor Vehicles Act fines & norms',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="9" width="24" height="32" rx="5" fill="#ffffff" />
          <rect x="16" y="14" width="16" height="5" rx="2" fill="#fbbf24" />
          <line x1="16" y1="24" x2="30" y2="24" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="30" x2="26" y2="30" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      action: () => setShowRulesModal(true),
    },
  ];

  const otherServices = [
    {
      title: 'Resale value',
      icon: '💰',
      tag: 'Market Appraisal',
      desc: 'Calculate real-time valuation for used cars and bikes',
      action: () => setShowResaleModal(true),
    },
    {
      title: 'RTO office',
      icon: '🏢',
      tag: 'Live GPS & Forms',
      desc: 'Find nearby RTO codes, address, timings & forms',
      action: () => setShowRtoOfficeModal(true),
    },
    {
      title: 'Traffic rules & penalty',
      icon: '🚦',
      tag: 'Official MV Act',
      desc: 'View all traffic offenses, fines & points system',
      action: () => setShowRulesModal(true),
    },
  ];

  const carServices = [
    { title: 'Car insurance', icon: '🚗', action: () => navigate('/car-insurance') },
    { title: 'Check car challan', icon: '🚨', action: () => setShowChallanModal(true) },
    { title: 'Sell your car', icon: '🔑', action: () => setShowResaleModal(true) },
    { title: 'Check car history', icon: '📋', action: () => navigate('/rc-search') },
    { title: 'Buy used car', icon: '🚙', action: () => navigate('/rc-search') },
    { title: 'Car check', icon: '🔧', action: () => navigate('/rc-search') },
    { title: 'FASTag manager', icon: '💳', action: () => navigate('/rc-search') },
    { title: 'Cash loan', icon: '💰', action: () => setShowResaleModal(true) },
  ];

  const bikeServices = [
    { title: 'Bike insurance', icon: '🏍️', action: () => navigate('/bike-insurance') },
    { title: 'Pay bike challan', icon: '👮', action: () => setShowChallanModal(true) },
    { title: 'Bike resale value', icon: '🪙', action: () => setShowResaleModal(true) },
    { title: 'New bikes', icon: '✨', action: () => navigate('/bike-insurance') },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f8fafc' }}>
        <div className="app-content-container">
          {/* ================= SECTION MELA ULLATHU (IMPROVED TOP SECTION) ================= */}
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px 22px 16px',
              margin: '0 auto 20px auto',
              maxWidth: '860px',
            }}
          >
            {/* Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                padding: '4px 14px',
                borderRadius: '24px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#1d4ed8',
                marginBottom: '10px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
              }}
            >
              <span>🚗</span>
              <span>ALL-IN-ONE VEHICLE SOLUTION</span>
            </div>

            {/* Main Heading */}
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '2.1rem',
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Vehicle Services & Citizen Hub
            </h1>

            {/* Subtitle */}
            <p
              style={{
                margin: '0 auto',
                fontSize: '0.92rem',
                color: '#64748b',
                maxWidth: '680px',
                lineHeight: 1.5,
              }}
            >
              Access verified RTO office directory, take learner license mock exams, check camera challans, calculate resale valuation, and manage vehicle documents.
            </p>
          </div>

          {/* ================= SECTION: EXCLUSIVE SERVICES ================= */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em', fontFamily: 'Outfit' }}>
                Exclusive services
              </h3>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {exclusiveServices.map((s) => (
                <div
                  key={s.id}
                  onClick={s.action}
                  className="white-card"
                  style={{
                    background: s.gradient,
                    borderRadius: '20px',
                    padding: '20px 18px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.32)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '148px',
                    border: 'none',
                    margin: 0,
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(37, 99, 235, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(37, 99, 235, 0.32)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.08rem', lineHeight: 1.25, marginBottom: '4px' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#dbeafe', fontWeight: 500 }}>
                      {s.subtitle}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                    <div style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= SECTION: OTHER SERVICES ================= */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Outfit' }}>
                Other services
              </h3>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {otherServices.map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #e2e8f0',
                    padding: '22px 18px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(37, 99, 235, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{item.icon}</div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontFamily: 'Outfit' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700, marginBottom: '6px' }}>
                    {item.tag}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= SECTION: GET CAR SERVICE REPORT BANNER ================= */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 70%, #0284c7 100%)',
                color: '#ffffff',
                borderRadius: '22px',
                padding: '24px 30px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '18px',
                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.35)',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Outfit' }}>
                  Get car service report
                </h4>
                <div style={{ display: 'flex', gap: '18px', fontSize: '0.84rem', color: '#dbeafe', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#86efac', fontSize: '1.15rem' }} /> Kilometer reading
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#86efac', fontSize: '1.15rem' }} /> Accident history
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#86efac', fontSize: '1.15rem' }} /> Insurance validity
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/rc-search')}
                style={{
                  background: '#ffffff',
                  color: '#1e40af',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '11px 26px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Get report
              </button>
            </div>
          </div>

          {/* ================= SECTION: CARS ================= */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem' }}>🚗</span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Outfit' }}>
                  Cars
                </h4>
              </div>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
            </div>

            <div className="car-marquee-wrapper">
              <div className="car-marquee-track">
                {/* 2 sets of carServices for seamless infinite moving loop */}
                {[...carServices, ...carServices].map((c, i) => (
                  <div
                    key={`car-${i}`}
                    className="car-marquee-card"
                    onClick={c.action}
                  >
                    <div className="car-icon-bubble">
                      <span style={{ fontSize: '1.75rem' }}>{c.icon}</span>
                    </div>
                    <span className="car-card-title">
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= SECTION: TWO WHEELERS ================= */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem' }}>🏍️</span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Outfit' }}>
                  Two wheelers
                </h4>
              </div>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
            </div>

            <div className="car-marquee-wrapper">
              <div className="car-marquee-track reverse-track">
                {/* 4 sets of bikeServices for seamless infinite moving loop */}
                {[...bikeServices, ...bikeServices, ...bikeServices, ...bikeServices].map((b, i) => (
                  <div
                    key={`bike-${i}`}
                    className="car-marquee-card"
                    onClick={b.action}
                  >
                    <div className="car-icon-bubble">
                      <span style={{ fontSize: '1.75rem' }}>{b.icon}</span>
                    </div>
                    <span className="car-card-title">
                      {b.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= SECTION: REAL CAR & BIKE ACCIDENT VIDEO CARD ================= */}
          <div className="real-accident-card">
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                Vehicle Info
              </div>
              <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', fontFamily: 'Outfit' }}>
                ALL-IN-ONE VEHICLE SOLUTION
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                Accident Spot Assistance & Instant Cashless Claim
              </p>
            </div>

            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                poster="/assets/car_bike_accident.jpg"
                className="real-accident-video"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '420px',
                  borderRadius: '16px',
                  display: 'block',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                <source src="/assets/car_accident_video.webm" type="video/webm" />
                <img
                  src="/assets/car_bike_accident.jpg"
                  alt="Car and Bike Accident Scene"
                  className="real-accident-img"
                />
              </video>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <Footer />

        {/* ================= INTERACTIVE MODALS ================= */}
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

        {/* RTO Office Directory & Forms Modal */}
        <RtoOfficeModal
          isOpen={showRtoOfficeModal}
          onClose={() => setShowRtoOfficeModal(false)}
        />

        {/* Resale Value Calculator Modal */}
        <ResaleValueModal
          isOpen={showResaleModal}
          onClose={() => setShowResaleModal(false)}
        />

        {/* Traffic Rules & Penalties Directory Modal */}
        <TrafficRulesModal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
        />
      </IonContent>
    </IonPage>
  );
};
