import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
  IonButton,
} from '@ionic/react';
import {
  chevronDownOutline,
  chevronUpOutline,
  shieldCheckmarkOutline,
  arrowForwardOutline,
  checkmarkCircle,
  closeCircle,
  searchOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RcDetailsModal } from '../components/RcDetailsModal';
import { ChallanModal } from '../components/ChallanModal';
import { api, VehicleRecord } from '../services/api';

export const HomeTab: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [showRcModal, setShowRcModal] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [modalPlate, setModalPlate] = useState('MH01AE8055');
  const [inputPlate, setInputPlate] = useState('');
  const [activeTab, setActiveTab] = useState<string>('search');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroTabs = [
    { id: 'search', label: 'Search\nOwner Details', icon: '🔍', placeholder: 'Enter Vehicle Registration Number (e.g. MH01AE8055)', btnLabel: 'Search Owner Details' },
    { id: 'challan', label: 'Check & Pay\nChallan', icon: '🚨', placeholder: 'Enter Vehicle or Challan Number (e.g. MH01AE8055)', btnLabel: 'Check Challan' },
    { id: 'car_insurance', label: 'Car\nInsurance', icon: '🚗', placeholder: 'Enter Car Number for Instant 85% Off Quotes', btnLabel: 'Car Insurance' },
    { id: 'bike_insurance', label: 'Bike\nInsurance', icon: '🏍️', placeholder: 'Enter Bike Number for ₹538/yr Quotes', btnLabel: 'Bike Insurance' },
    { id: 'sell_car', label: 'Sell\nYour Car', icon: '💰', placeholder: 'Enter Car Number for Free Doorstep Valuation', btnLabel: 'Sell Your Car' },
    { id: 'history', label: 'Car History\nReport', icon: '📋', placeholder: 'Enter Vehicle Number for 140-Point History', btnLabel: 'Car History' },
    { id: 'fastag', label: 'FASTag\nManager', icon: '💳', placeholder: 'Enter Vehicle Number for Instant FASTag Recharge', btnLabel: 'FASTag Manager' },
    { id: 'more', label: 'More\nServices', icon: '➕', placeholder: 'Enter Vehicle Number for Driving Exam & RTO Services', btnLabel: 'All Services' },
  ];

  const currentTabConfig = heroTabs.find((t) => t.id === activeTab) || heroTabs[0];

  const handleVehicleSearch = async (plate: string) => {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) return;
    setModalPlate(cleanPlate);
    try {
      const v = await api.getVehicleRC(cleanPlate);
      setSelectedVehicle(v);
      setShowRcModal(true);
    } catch (err: any) {
      console.error('Vehicle lookup error:', err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      alert(serverMsg || `Could not retrieve records for ${cleanPlate}. Please check registration number.`);
    }
  };

  const openChallans = (plate = 'MH01AE8055') => {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    setModalPlate(cleanPlate);
    setShowChallanModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plate = inputPlate.trim() || 'MH01AE8055';

    switch (activeTab) {
      case 'search':
        handleVehicleSearch(plate);
        break;
      case 'challan':
        openChallans(plate);
        break;
      case 'car_insurance':
        navigate('/insurance');
        break;
      case 'bike_insurance':
        navigate('/insurance');
        break;
      case 'sell_car':
        alert(`Sell Car Appraisal: Free doorstep inspection booked for ${plate}. Instant payment guaranteed.`);
        break;
      case 'history':
        handleVehicleSearch(plate);
        break;
      case 'fastag':
        alert(`FASTag Manager: Balance ₹420.50 for ${plate}. Linked to NHAI Toll Network.`);
        break;
      case 'more':
        navigate('/services');
        break;
      default:
        handleVehicleSearch(plate);
    }
  };

  const topFeatures = [
    {
      id: 'rc',
      label: 'RC details',
      badge: null,
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#eff6ff" />
          <path d="M12 28L16 20H32L36 28V33H12V28Z" fill="#3b82f6" />
          <circle cx="17" cy="33" r="3.5" fill="#1e293b" />
          <circle cx="31" cy="33" r="3.5" fill="#1e293b" />
          <circle cx="28" cy="20" r="7" stroke="#0ea5e9" strokeWidth="3" fill="#ffffff" />
          <line x1="33" y1="25" x2="39" y2="31" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      ),
      action: () => handleVehicleSearch('MH01AE8055'),
    },
    {
      id: 'challan',
      label: 'Pay challan',
      badge: 'Fine',
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#fef2f2" />
          <circle cx="24" cy="16" r="6" fill="#ef4444" />
          <path d="M14 34C14 28 18 25 24 25C30 25 34 28 34 34V36H14V34Z" fill="#ef4444" />
          <rect x="26" y="22" width="10" height="14" rx="2" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="28" y1="26" x2="34" y2="26" stroke="#ef4444" strokeWidth="1.5" />
        </svg>
      ),
      action: () => openChallans('MH01AE8055'),
    },
    {
      id: 'car_ins',
      label: 'Car insurance',
      badge: '85% off',
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#f0fdf4" />
          <path d="M24 12L14 17V26C14 33 24 38 24 38C24 38 34 33 34 26V17L24 12Z" fill="#16a34a" />
          <path d="M20 25L23 28L29 21" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      action: () => navigate('/insurance'),
    },
    {
      id: 'bike_ins',
      label: 'Bike insurance',
      badge: '₹538/yr',
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#eff6ff" />
          <circle cx="16" cy="30" r="5" stroke="#2563eb" strokeWidth="2.5" />
          <circle cx="32" cy="30" r="5" stroke="#2563eb" strokeWidth="2.5" />
          <path d="M16 30L22 22H27L32 30" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 18V26" stroke="#2563eb" strokeWidth="2" />
        </svg>
      ),
      action: () => navigate('/insurance'),
    },
    {
      id: 'loan',
      label: 'Personal loan',
      badge: 'Fast',
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#fefce8" />
          <circle cx="24" cy="18" r="5" fill="#ca8a04" />
          <path d="M16 34C16 29 20 26 24 26C28 26 32 29 32 34" fill="#ca8a04" />
          <circle cx="32" cy="26" r="6" fill="#10b981" />
          <text x="32" y="29" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">₹</text>
        </svg>
      ),
      action: () => alert('Vehicle Equity Loan: Instant approval up to ₹5,00,000 against vehicle RC.'),
    },
    {
      id: 'history',
      label: 'Car history',
      badge: null,
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#eff6ff" />
          <rect x="16" y="14" width="16" height="20" rx="3" fill="#3b82f6" />
          <line x1="20" y1="18" x2="28" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="23" x2="28" y2="23" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="30" r="4" fill="#0284c7" />
        </svg>
      ),
      action: () => handleVehicleSearch('DL01AB1234'),
    },
    {
      id: 'fastag',
      label: 'FASTag Manager',
      badge: null,
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#f0fdfa" />
          <rect x="13" y="18" width="22" height="12" rx="3" fill="#0d9488" />
          <text x="24" y="26" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">FASTag</text>
        </svg>
      ),
      action: () => alert('FASTag Recharge: Active balance ₹420.50. Instant UPI top-up enabled.'),
    },
    {
      id: 'car_check',
      label: 'Car check',
      badge: null,
      icon: (
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#f1f5f9" />
          <path d="M16 28L20 20H32L34 28" stroke="#475569" strokeWidth="2.5" />
          <path d="M28 14L34 20" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      action: () => handleVehicleSearch('TN09AZ4321'),
    },
  ];

  const faqs = [
    {
      q: 'How can I check my vehicle details in mParivahan?',
      a: 'You can check vehicle details directly on Vehicleinfo by entering your registration number (e.g. MH01AE8055). We securely query the official Parivahan Vahan database to fetch maker, engine displacement CC, fitness validity, and insurance status.',
    },
    {
      q: 'How to find RC details in Parivahan?',
      a: 'Enter your vehicle registration number on our search portal. You will see verified vehicle specifications, masked owner identity, registration date, chassis/engine numbers, and RTO authority location.',
    },
    {
      q: 'Is the virtual RC legally valid across India?',
      a: 'Yes, as per Rule 139 of the Central Motor Vehicles Rules, 1989 and MoRTH advisory, digital and virtual RC presented via approved portals like Vehicleinfo or mParivahan is legally valid for traffic police inspection.',
    },
    {
      q: 'What is Lok Adalat for Traffic Challans?',
      a: 'National Lok Adalat is held periodically across Indian courts to dispose of pending traffic challans at heavily discounted fines (up to 50% waiver). You can settle and pay traffic police fines online directly through our e-Challan portal.',
    },
    {
      q: 'How to check if the RC is original or fake?',
      a: 'Verify that the vehicle maker, engine displacement (CC), registration date, and RTO authority match the official records retrieved through our Parivahan Vahan verified search.',
    },
    {
      q: 'How can I check traffic challans online?',
      a: 'Click on the "Check & Pay Challan" tab above, enter your vehicle number (e.g. MH01AE8055), and view all pending traffic police challans, photos, violation codes, and pay fines instantly.',
    },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f8fafc' }}>
        <div className="app-content-container" style={{ paddingBottom: '0' }}>
          {/* Section 1: Hero Home Header (matching vehicleinfo.app desktop) */}
          <div className="hero-home-header">
            <h1 className="hero-home-title">
              Vehicleinfo<br />
              <span>All-In-One Vehicle Solution</span>
            </h1>
            <p className="hero-home-subtitle">
              Check and pay traffic challans online, buy or renew insurance, check vehicle owner details, vehicle information, and track your car&apos;s service history.
            </p>
          </div>

          {/* Section 2: Hero Tabs Group (8 Tabs matching vehicleinfo.app) */}
          <div className="hero-tabs-container">
            {heroTabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  className={`hero-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span className="hero-tab-icon">{t.icon}</span>
                  <span className="hero-tab-label" style={{ whiteSpace: 'pre-line' }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Section 3: High-Contrast Plate Search Form (matching vehicleinfo.app) */}
          <form className="hero-search-form" onSubmit={handleFormSubmit}>
            <div className="flag-badge">
              {/* Authentic India Flag */}
              <svg width="24" height="18" viewBox="0 0 30 20" style={{ borderRadius: '2px' }}>
                <rect width="30" height="6.6" fill="#FF9933" />
                <rect y="6.6" width="30" height="6.6" fill="#FFFFFF" />
                <rect y="13.2" width="30" height="6.6" fill="#128807" />
                <circle cx="15" cy="9.9" r="2.5" fill="#000088" />
              </svg>
              <span className="flag-text">IND</span>
            </div>

            <input
              type="text"
              className="hero-plate-input"
              value={inputPlate}
              onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
              placeholder={currentTabConfig.placeholder}
              autoComplete="off"
            />

            <button type="submit" className="hero-submit-btn">
              <IonIcon icon={searchOutline} style={{ fontSize: '1.1rem' }} />
              <span>{currentTabConfig.btnLabel}</span>
            </button>
          </form>



          {/* Section 4: PUC Status Quick Hero Card */}
          <div
            className="royal-header-gradient"
            style={{
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '0 10px 30px -4px rgba(37, 99, 235, 0.35)',
              marginBottom: '36px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                  Verify vehicle PUC status & expiry
                </h2>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#dbeafe', maxWidth: '520px' }}>
                  Avoid ₹10,000 fine under the Motor Vehicles (Amendment) Act. Check your Pollution Under Control (PUC) certificate validity instantly.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#16a34a', color: '#ffffff', padding: '4px 12px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={checkmarkCircle} /> Valid
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.85)', color: '#ffffff', padding: '4px 12px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={closeCircle} /> Expired
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '4px 12px', borderRadius: '14px', backdropFilter: 'blur(4px)' }}>
                    Parivahan Verified
                  </span>
                </div>
              </div>

              {/* White Car Graphic with radar scan rings */}
              <div style={{ position: 'relative', width: '160px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '140px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', filter: 'blur(8px)', bottom: '4px' }} />
                <svg width="150" height="85" viewBox="0 0 160 90" fill="none">
                  <ellipse cx="80" cy="55" rx="75" ry="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" />
                  <ellipse cx="80" cy="55" rx="55" ry="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path d="M25 50L45 32H115L138 50V64H25V50Z" fill="#ffffff" />
                  <path d="M48 35H76V48H35L48 35Z" fill="#1e293b" />
                  <path d="M80 35H112L124 48H80V35Z" fill="#1e293b" />
                  <rect x="132" y="52" width="6" height="5" rx="1.5" fill="#38bdf8" />
                  <rect x="25" y="52" width="4" height="5" rx="1.5" fill="#ef4444" />
                  <circle cx="48" cy="64" r="10" fill="#0f172a" />
                  <circle cx="48" cy="64" r="5" fill="#94a3b8" />
                  <circle cx="115" cy="64" r="10" fill="#0f172a" />
                  <circle cx="115" cy="64" r="5" fill="#94a3b8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Section 5: Essential Vehicle Services (4 Cards matching vehicleinfo.app) */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Essential Vehicle Services
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div className="essential-services-grid">
              {/* Card 1: Blue - Settle Pending Fines */}
              <div className="essential-card" style={{ borderTop: '4px solid #2563eb' }}>
                <div>
                  <div className="essential-card-header">
                    <div className="essential-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      👮‍♂️
                    </div>
                    <div>
                      <h4 className="essential-card-title">Settle Pending Fines Quickly</h4>
                      <p className="essential-card-desc">Easily check and pay challans before court summons</p>
                    </div>
                  </div>
                  <ul className="essential-card-list">
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#2563eb' }} /> Clear Traffic Challans online</li>
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#2563eb' }} /> Up to 50% waiver in Lok Adalat</li>
                  </ul>
                </div>
                <button
                  className="essential-card-btn"
                  onClick={() => openChallans('MH01AE8055')}
                  style={{ background: '#2563eb', color: '#ffffff' }}
                >
                  Pay Challans Instantly →
                </button>
              </div>

              {/* Card 2: Amber - Service History Report */}
              <div className="essential-card" style={{ borderTop: '4px solid #f59e0b' }}>
                <div>
                  <div className="essential-card-header">
                    <div className="essential-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      📋
                    </div>
                    <div>
                      <h4 className="essential-card-title">Get Service History Report</h4>
                      <p className="essential-card-desc">Get full maintenance & accident record of your vehicle</p>
                    </div>
                  </div>
                  <ul className="essential-card-list">
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#f59e0b' }} /> Verify Genuine Kilometers</li>
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#f59e0b' }} /> 140-Point Diagnostic Inspection</li>
                  </ul>
                </div>
                <button
                  className="essential-card-btn"
                  onClick={() => handleVehicleSearch('DL01AB1234')}
                  style={{ background: '#f59e0b', color: '#ffffff' }}
                >
                  Explore Service Records →
                </button>
              </div>

              {/* Card 3: Green - Sell Car at Best Price */}
              <div className="essential-card" style={{ borderTop: '4px solid #16a34a' }}>
                <div>
                  <div className="essential-card-header">
                    <div className="essential-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      💰
                    </div>
                    <div>
                      <h4 className="essential-card-title">Sell Car at Best Price</h4>
                      <p className="essential-card-desc">Sell your used car with the best verified value offer</p>
                    </div>
                  </div>
                  <ul className="essential-card-list">
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#16a34a' }} /> Free Doorstep Car Inspection</li>
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#16a34a' }} /> Instant Bank Transfer in 24h</li>
                  </ul>
                </div>
                <button
                  className="essential-card-btn"
                  onClick={() => alert('Vehicle Valuation: Scheduled free doorstep car valuation.')}
                  style={{ background: '#16a34a', color: '#ffffff' }}
                >
                  Get Car Valuation Now →
                </button>
              </div>

              {/* Card 4: Red - Quick FASTag Recharge */}
              <div className="essential-card" style={{ borderTop: '4px solid #ef4444' }}>
                <div>
                  <div className="essential-card-header">
                    <div className="essential-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                      💳
                    </div>
                    <div>
                      <h4 className="essential-card-title">Quick FASTag Recharge</h4>
                      <p className="essential-card-desc">Instantly recharge your FASTag for seamless highway tolls</p>
                    </div>
                  </div>
                  <ul className="essential-card-list">
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#ef4444' }} /> Check Live NHAI FASTag Balance</li>
                    <li><IonIcon icon={checkmarkCircle} style={{ color: '#ef4444' }} /> Recharged Instantly via UPI</li>
                  </ul>
                </div>
                <button
                  className="essential-card-btn"
                  onClick={() => alert('FASTag Recharge: Active balance ₹420.50. Instant recharge active.')}
                  style={{ background: '#ef4444', color: '#ffffff' }}
                >
                  Recharge FASTag →
                </button>
              </div>
            </div>
          </div>


          {/* Section 7: Top Features (8 circular icons) */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Top features
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px 12px' }}>
              {topFeatures.map((f) => (
                <div key={f.id} className="feature-item" onClick={f.action}>
                  <div className="feature-icon-circle">
                    {f.icon}
                  </div>
                  <span className="feature-label">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Trending New Bikes & Cars */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Trending New Bikes
              </h3>
              <button
                onClick={() => navigate('/insurance')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
              >
                View all bikes →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Hunter 350', brand: 'Royal Enfield', price: '₹1.50 Lakh', cc: '349cc' },
                { name: 'Splendor Plus', brand: 'Hero MotoCorp', price: '₹75,400', cc: '97.2cc' },
                { name: 'MT-15 V2', brand: 'Yamaha', price: '₹1.68 Lakh', cc: '155cc' },
                { name: 'Activa 6G', brand: 'Honda', price: '₹79,800', cc: '109.5cc' },
              ].map((bike, i) => (
                <div
                  key={i}
                  className="white-card"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                  onClick={() => navigate('/insurance')}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏍️</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{bike.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{bike.brand} • {bike.cc}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>{bike.price}</div>
                  <button
                    style={{
                      marginTop: '10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '14px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    Compare Quotes →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9: Frequently Asked Questions (from vehicleinfo.app) */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Frequently Asked Questions
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '16px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="faq-item" onClick={() => setOpenFaq(isOpen ? null : i)}>
                    <div className="faq-question">
                      <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{faq.q}</span>
                      <IonIcon icon={isOpen ? chevronUpOutline : chevronDownOutline} style={{ color: '#64748b', fontSize: '1.1rem' }} />
                    </div>
                    {isOpen && (
                      <div className="faq-answer" style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 10: Rich Official Footer (AutoIQ / Cars24 Company) */}
        <Footer />

        {/* RC Details Modal */}
        <RcDetailsModal
          vehicle={selectedVehicle}
          isOpen={showRcModal}
          onClose={() => setShowRcModal(false)}
          onPayChallan={() => openChallans(modalPlate)}
        />

        {/* Challan Modal */}
        <ChallanModal
          isOpen={showChallanModal}
          onClose={() => setShowChallanModal(false)}
          regNo={modalPlate}
        />
      </IonContent>
    </IonPage>
  );
};
