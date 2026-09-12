import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonRange,
  IonSpinner,
  IonIcon,
  IonButton,
} from '@ionic/react';
import {
  checkmarkCircle,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  logoWhatsapp,
  star,
  chevronDownOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { InsurerCard } from '../components/InsurerCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { api, InsurerQuote, QuoteResponse, PolicyRecord } from '../services/api';

export const InsuranceTab: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<'bike' | 'car'>('bike');
  const [regNo, setRegNo] = useState('MH01AE8055');
  const [engineCc, setEngineCc] = useState(349);
  const [idv, setIdv] = useState(75000);
  const [ncb, setNcb] = useState(20);
  const [policyType, setPolicyType] = useState<'comprehensive' | 'third_party'>('comprehensive');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['zero_dep', 'pa_cover']);

  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [selectedQuoteForCheckout, setSelectedQuoteForCheckout] = useState<InsurerQuote | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getQuotes({
        engine_capacity_cc: engineCc,
        idv: idv,
        ncb_percent: ncb,
        selected_addons: selectedAddons,
      });
      setQuoteData(data);
    } catch (err) {
      console.error('Failed to calculate quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [engineCc, idv, ncb, selectedAddons]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const toggleAddon = (key: string) => {
    if (selectedAddons.includes(key)) {
      setSelectedAddons(selectedAddons.filter((k) => k !== key));
    } else {
      setSelectedAddons([...selectedAddons, key]);
    }
  };

  const insuranceTypes = [
    {
      title: 'Comprehensive',
      desc: 'Covers both third-party liabilities & damages to your own vehicle as well',
      badge: 'Recommended',
      icon: '🛡️',
    },
    {
      title: 'Third party',
      desc: 'Covers only damages & losses caused to a third party person',
      badge: 'Mandatory',
      icon: '⚖️',
    },
    {
      title: 'Own damage',
      desc: 'Covers loss and damage to your own vehicle in accidents and collisions',
      badge: null,
      icon: '🏍️',
    },
    {
      title: 'Zero depreciation',
      desc: 'Covers full claim without deducting depreciation on replaced parts',
      badge: '100% Payout',
      icon: '✨',
    },
  ];

  const insuranceFaqs = [
    {
      q: 'What is vehicle insurance?',
      a: 'Vehicle insurance provides financial protection against physical damage or bodily injury resulting from traffic collisions and against liability that could also arise from incidents in a vehicle.',
    },
    {
      q: 'How to check vehicle insurance?',
      a: 'You can check your insurance validity directly in the "RC Status" or "Home" tab by entering your vehicle registration number plate.',
    },
    {
      q: 'How to check vehicle insurance status?',
      a: 'The status will display as "Active", "Expiring Soon", or "Expired" alongside the exact policy expiry date synchronized with Parivahan Vahan.',
    },
    {
      q: 'How to pay for vehicle insurance online?',
      a: 'Select any quote from Digit, HDFC ERGO, ICICI Lombard, or Bajaj Allianz, click "Select & Buy Now", fill in your details, and pay via instant UPI or Card for immediate policy issuance.',
    },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>
      <IonContent fullscreen style={{ '--background': '#ffffff' }}>
        <div className="app-content-container">
          {/* Top Banner (matching Screenshot 3) */}
          <div
            className="royal-header-gradient"
            style={{
              borderRadius: '24px',
              padding: '24px 28px 44px 28px',
              color: '#ffffff',
              boxShadow: '0 10px 30px -4px rgba(37, 99, 235, 0.35)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25 }}>
                  Hassle-free car &<br />bike Insurance
                </h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem', color: '#dbeafe', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1.1rem' }} /> Quick instant claims
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1.1rem' }} /> Save more with NCB discounts
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa', fontSize: '1.1rem' }} /> IRDAI Standard Formula
                  </span>
                </div>
              </div>

              {/* Bike & Car Graphic */}
              <div style={{ position: 'relative', width: '150px', height: '90px' }}>
                <svg width="150" height="90" viewBox="0 0 160 100" fill="none">
                  <circle cx="110" cy="65" r="14" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="60" cy="65" r="14" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M60 65L85 45H105L110 65" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 45L78 30H70" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="85" cy="40" r="12" fill="rgba(255,255,255,0.2)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Two Prominent Selector Cards (Car Insurance / Bike Insurance) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {/* Car Insurance */}
            <div
              onClick={() => setVehicleType('car')}
              className="white-card"
              style={{
                background: vehicleType === 'car' ? '#eff6ff' : '#ffffff',
                border: `2px solid ${vehicleType === 'car' ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '18px',
                padding: '18px 20px',
                cursor: 'pointer',
                margin: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Car insurance</span>
                <span style={{ background: '#2563eb', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                  →
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '2rem' }}>🚗</span>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>Up to 85% discount</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Zero dep & road side assistance</div>
                </div>
              </div>
            </div>

            {/* Bike Insurance */}
            <div
              onClick={() => setVehicleType('bike')}
              className="white-card"
              style={{
                background: vehicleType === 'bike' ? '#eff6ff' : '#ffffff',
                border: `2px solid ${vehicleType === 'bike' ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '18px',
                padding: '18px 20px',
                cursor: 'pointer',
                margin: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Bike insurance</span>
                <span style={{ background: '#2563eb', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                  →
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '2rem' }}>🏍️</span>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>Starting ₹538/yr</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Instant policy issued in 2 mins</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Comparison Engine: 2-Column Desktop Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '36px' }}>
            {/* Left Column: Quotation Controls */}
            <div>
              <div className="white-card" style={{ padding: '20px', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Vehicle Plate</span>
                    <span className="number-plate-styled" style={{ fontSize: '0.92rem', padding: '3px 10px' }}>
                      {regNo}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Selected IDV</span>
                    <strong style={{ fontSize: '1.35rem', color: '#2563eb', fontFamily: 'Outfit' }}>
                      ₹{idv.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* IDV Slider */}
                <div style={{ marginBottom: '18px' }}>
                  <IonRange
                    min={25000}
                    max={150000}
                    step={2500}
                    value={idv}
                    onIonChange={(e) => setIdv(Number(e.detail.value))}
                    style={{ '--bar-background-active': '#2563eb', '--knob-background': '#2563eb', padding: 0 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>Min: ₹25,000</span>
                    <span>Max: ₹1,50,000</span>
                  </div>
                </div>

                {/* NCB Selector */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                      No Claim Bonus (NCB Discount)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                      {ncb}% Off OD
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[0, 20, 35, 50].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setNcb(rate)}
                        style={{
                          background: ncb === rate ? '#2563eb' : '#f8fafc',
                          color: ncb === rate ? '#ffffff' : '#475569',
                          border: `1.5px solid ${ncb === rate ? '#2563eb' : '#e2e8f0'}`,
                          borderRadius: '10px',
                          padding: '8px 0',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Policy Type Switch */}
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    Coverage Type
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => setPolicyType('comprehensive')}
                      style={{
                        background: policyType === 'comprehensive' ? '#eff6ff' : '#ffffff',
                        border: `1.5px solid ${policyType === 'comprehensive' ? '#2563eb' : '#e2e8f0'}`,
                        color: policyType === 'comprehensive' ? '#1d4ed8' : '#64748b',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Comprehensive (TP + OD)
                    </button>
                    <button
                      onClick={() => setPolicyType('third_party')}
                      style={{
                        background: policyType === 'third_party' ? '#eff6ff' : '#ffffff',
                        border: `1.5px solid ${policyType === 'third_party' ? '#2563eb' : '#e2e8f0'}`,
                        color: policyType === 'third_party' ? '#1d4ed8' : '#64748b',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Third Party Only
                    </button>
                  </div>
                </div>

                {/* 6 Add-on Covers */}
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    Recommended Add-on Covers ({selectedAddons.length} opted)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { key: 'zero_dep', label: 'Zero Depreciation', price: '₹450' },
                      { key: 'pa_cover', label: 'Personal Accident (₹15L)', price: '₹330' },
                      { key: 'rsa', label: '24x7 Roadside Assist', price: '₹149' },
                      { key: 'engine_protect', label: 'Engine Protection', price: '₹299' },
                      { key: 'ncb_retention', label: 'NCB Protection', price: '₹199' },
                      { key: 'consumables', label: 'Consumables Cover', price: '₹120' },
                    ].map((addon) => {
                      const isChecked = selectedAddons.includes(addon.key);
                      return (
                        <div
                          key={addon.key}
                          onClick={() => toggleAddon(addon.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: isChecked ? '#eff6ff' : '#f8fafc',
                            border: `1px solid ${isChecked ? '#93c5fd' : '#e2e8f0'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isChecked ? '#1d4ed8' : '#334155' }}>
                              {addon.label}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>+{addon.price}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Comparison Quotes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  Live Insurer Quotes (4 Plans)
                </h3>
                {loading && <IonSpinner name="dots" style={{ color: '#2563eb' }} />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {quoteData?.quotes.map((quote) => (
                  <div
                    key={quote.insurer_id}
                    className="white-card"
                    style={{
                      margin: 0,
                      borderLeft: `5px solid ${quote.brand_color || '#2563eb'}`,
                      padding: '18px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                          {quote.insurer_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                          ★ {quote.rating} • {quote.claim_settlement_ratio} Claims • {quote.cashless_garages} Garages
                        </div>
                      </div>

                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {quote.tag}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Final Premium (incl. 18% GST)</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', fontFamily: 'Outfit' }}>
                          ₹{Math.round(quote.total_premium).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <IonButton
                        onClick={() => setSelectedQuoteForCheckout(quote)}
                        style={{
                          '--background': '#2563eb',
                          '--color': '#ffffff',
                          '--border-radius': '10px',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          height: '42px',
                        }}
                      >
                        Buy Policy →
                      </IonButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Types of Insurance (matching Screenshot 3) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                Types of insurance
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {insuranceTypes.map((item, i) => (
                <div
                  key={i}
                  className="white-card"
                  style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      flexShrink: 0,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{item.title}</strong>
                      {item.badge && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Why renew your vehicle insurance (matching Screenshot 3) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                Why renew your vehicle insurance
              </h3>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: '#ffffff', borderRadius: '18px', padding: '18px 20px', boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.3)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800 }}>
                  Avoid heavy traffic fines
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#dbeafe', lineHeight: 1.4 }}>
                  Uninsured driving may incur ₹10,000 fine under the Motor Vehicles Act.
                </p>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: '#ffffff', borderRadius: '18px', padding: '18px 20px', boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.35)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800 }}>
                  Peace of mind
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#dbeafe', lineHeight: 1.4 }}>
                  24x7 claim support & complimentary towing in case of emergency.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Need Help WhatsApp (matching Screenshot 3) */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={() => alert('WhatsApp Support: Connecting with 24x7 Insurance Officer...')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IonIcon icon={logoWhatsapp} style={{ fontSize: '2rem', color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>Chat on WhatsApp</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Get assistance anytime you need it</div>
                </div>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94a3b8' }} />
            </div>
          </div>

          {/* Section: Trust Statistics (matching Screenshot 3) */}
          <div style={{ padding: '0 16px 20px 16px' }}>
            <div
              style={{
                background: '#eff6ff',
                borderRadius: '16px',
                padding: '18px 14px',
                textAlign: 'center',
                border: '1px solid #dbeafe',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '4px 10px', borderRadius: '20px', marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <IonIcon icon={star} style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>4.5</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rated by 4 lakh+ users</span>
              </div>

              <h4 style={{ margin: '2px 0 12px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1d4ed8' }}>
                Trusted by 5Cr+ vehicle owners across India
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '10px', borderTop: '1px solid #dbeafe' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b', fontFamily: 'Outfit' }}>5Cr+</strong>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>App installs</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b', fontFamily: 'Outfit' }}>7 lakh+</strong>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Daily active users</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b', fontFamily: 'Outfit' }}>3 lakh+</strong>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Policies sold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Frequently Asked Questions */}
          <div style={{ padding: '0 16px 24px 16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
              Frequently Asked Questions
            </h4>
            <div style={{ borderTop: '1px solid #f1f5f9' }}>
              {insuranceFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="faq-item" onClick={() => setOpenFaq(isOpen ? null : i)}>
                    <div className="faq-question">
                      <span>{faq.q}</span>
                      <IonIcon icon={isOpen ? chevronUpOutline : chevronDownOutline} style={{ color: '#64748b', fontSize: '0.85rem' }} />
                    </div>
                    {isOpen && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Official Footer matching vehicleinfo.app */}
        <Footer />

        {/* Checkout Modal */}
        {selectedQuoteForCheckout && (
          <CheckoutModal
            quote={selectedQuoteForCheckout}
            vehicleRegNo={regNo}
            onClose={() => setSelectedQuoteForCheckout(null)}
            onSuccess={(policy) => {
              console.log('Policy purchased successfully:', policy);
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};
