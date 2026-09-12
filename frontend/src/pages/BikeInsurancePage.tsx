import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckoutModal } from '../components/CheckoutModal';
import { api, InsurerQuote } from '../services/api';

export const BikeInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsurerQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<InsurerQuote | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQuotesList, setShowQuotesList] = useState(false);

  const sampleBikes = [
    { plate: 'MH01AE8055', label: 'Hunter 350 (349cc)' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15 (155cc)' },
    { plate: 'TN09AZ4321', label: 'Activa 6G (109cc)' },
    { plate: 'KA05MH9999', label: 'KTM 390 (373cc)' },
    { plate: 'UP32BK7711', label: 'Splendor Plus (97cc)' },
  ];

  const handleCheckInsurance = async (plateToSearch?: string) => {
    const rawPlate = (plateToSearch || regNo).trim();
    const cleanPlate = rawPlate.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) {
      setErrorMsg('Please enter your bike registration number');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let cc = 349;
      let idv = 75000;
      try {
        const v = await api.getVehicleRC(cleanPlate);
        cc = v.engine_capacity_cc || 349;
      } catch {
        // use default bike specs
      }

      const qRes = await api.getQuotes({
        engine_capacity_cc: cc,
        idv: idv,
        ncb_percent: 20,
        selected_addons: ['zero_dep', 'pa_cover'],
      });

      setQuotes(qRes.quotes);
      setShowQuotesList(true);
    } catch (err) {
      console.error('Failed to get bike quotes:', err);
      setErrorMsg('Unable to calculate bike insurance quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen style={{ '--background': '#f8fafc' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>

          {/* Hero Banner matching Screenshot 3 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
              borderRadius: '24px',
              padding: '48px 40px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 36px -10px rgba(37, 99, 235, 0.35)',
            }}
          >
            {/* Background Watermark Scooter Silhouette */}
            <div
              style={{
                position: 'absolute',
                right: '25%',
                bottom: '-30px',
                opacity: 0.14,
                pointerEvents: 'none',
              }}
            >
              <svg width="400" height="260" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12-1c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>

            {/* Left Column: Heading & Sparkle Subhead */}
            <div style={{ flex: '1 1 480px', zIndex: 2 }}>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  lineHeight: 1.18,
                  margin: '0 0 20px 0',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Buy Bike Insurance Online - Two-Wheeler Insurance Renewal
              </h1>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>✨</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  Insurance plans starting at ₹457*
                </span>
              </div>
            </div>

            {/* Right Column: White Card matching Screenshot 3 */}
            <div
              style={{
                flex: '0 0 380px',
                maxWidth: '100%',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '32px 28px',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.22)',
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
                  handleCheckInsurance();
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

                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                {/* CHECK INSURANCE Button */}
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
                    'CHECK INSURANCE'
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



          {/* Instant Insurance Quotes Result Drawer */}
          {showQuotesList && (
            <div
              style={{
                marginTop: '32px',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                border: '1.5px solid #dbeafe',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Instant Two-Wheeler Insurance Quotes ({quotes.length} Insurers)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Vehicle: <strong>{regNo || 'MH01AE8055'}</strong> • IDV: ₹75,000 • NCB: 20%
                  </p>
                </div>
                <button
                  onClick={() => setShowQuotesList(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hide Quotes ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {quotes.map((q) => (
                  <div
                    key={q.insurer_id}
                    style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{q.insurer_name}</span>
                        <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          {q.claim_settlement_ratio}% CSR
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
                        Zero Dep included • 24x7 Roadside Assistance
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>
                        ₹{q.total_premium.toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}> / yr (incl. GST)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedQuote(q);
                        setShowCheckout(true);
                      }}
                      style={{
                        marginTop: '16px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      Buy Policy Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Section: What is Bike Insurance? matching Screenshot 3 */}
          <section style={{ marginTop: '48px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '32px',
              }}
            >
              {/* Left Text */}
              <div style={{ flex: '1 1 560px' }}>
                <h2
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#0f172a',
                    marginBottom: '18px',
                  }}
                >
                  What is Bike Insurance?
                </h2>

                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, marginBottom: '14px' }}>
                  Two-wheeler insurance, also known as Bike Insurance, is a protective cover designed to safeguard your motorcycle, scooter, against unforeseen events. Whether you ride a bike for daily commutes or occasional trips, having a two-wheeler insurance policy ensures financial protection and peace of mind.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7 }}>
                  Under the Motor Vehicles Act, third-party bike insurance is mandatory across India. Upgrading to Comprehensive Coverage protects your ride from accidents, fire, natural calamities, theft, and damages while on the road.
                </p>
              </div>

              {/* Right Illustration: Scooter with Policy and Person */}
              <div
                style={{
                  flex: '0 0 340px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
              >
                <svg width="320" height="240" viewBox="0 0 320 240" fill="none">
                  {/* Document Board */}
                  <rect x="190" y="30" width="90" height="130" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="202" y="45" width="66" height="8" rx="2" fill="#eab308" />
                  <rect x="202" y="62" width="50" height="4" rx="2" fill="#94a3b8" />
                  <rect x="202" y="72" width="60" height="4" rx="2" fill="#cbd5e1" />
                  <rect x="202" y="82" width="45" height="4" rx="2" fill="#cbd5e1" />
                  {/* Green Verified Circle */}
                  <circle cx="185" cy="105" r="14" fill="#10b981" />
                  <path d="M179 105L183 109L191 101" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Yellow Modern Scooter */}
                  <g transform="translate(50, 95)">
                    {/* Shadow */}
                    <ellipse cx="75" cy="95" rx="65" ry="8" fill="#cbd5e1" opacity="0.6" />
                    {/* Rear Wheel */}
                    <circle cx="28" cy="85" r="16" fill="#1e293b" />
                    <circle cx="28" cy="85" r="7" fill="#e2e8f0" />
                    {/* Front Wheel */}
                    <circle cx="120" cy="85" r="16" fill="#1e293b" />
                    <circle cx="120" cy="85" r="7" fill="#e2e8f0" />
                    {/* Scooter Body */}
                    <path
                      d="M20 75C20 60 35 55 50 55H70L95 40L115 40L118 70L95 85H40L20 75Z"
                      fill="#eab308"
                    />
                    {/* Seat */}
                    <path d="M35 52C35 48 45 46 65 46C75 46 80 52 80 52H35Z" fill="#1e293b" />
                    {/* Handle & Mirror */}
                    <line x1="95" y1="40" x2="105" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="108" cy="18" r="4" fill="#94a3b8" />
                    {/* Headlight */}
                    <circle cx="116" cy="45" r="6" fill="#fef08a" />
                  </g>

                  {/* Happy Rider Person */}
                  <g transform="translate(225, 100)">
                    {/* Head */}
                    <circle cx="20" cy="18" r="10" fill="#fcd34d" />
                    {/* Hair */}
                    <path d="M10 16C10 10 16 6 24 8C27 10 28 14 26 17Z" fill="#1e293b" />
                    {/* Shirt */}
                    <path d="M8 32C8 28 14 28 20 28C26 28 32 28 32 32V60H8V32Z" fill="#ffffff" stroke="#cbd5e1" />
                    {/* Tie */}
                    <polygon points="19,30 21,30 22,45 20,48 18,45" fill="#2563eb" />
                    {/* Pants */}
                    <rect x="9" y="60" width="10" height="35" fill="#1e293b" />
                    <rect x="21" y="60" width="10" height="35" fill="#1e293b" />
                  </g>
                </svg>
              </div>
            </div>
          </section>

          {/* Benefits of Bike Insurance Policy matching Screenshot 3 */}
          <section style={{ marginTop: '54px' }}>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                color: '#0f172a',
                marginBottom: '12px',
              }}
            >
              Benefits of Bike Insurance Policy
            </h2>

            <p style={{ fontSize: '0.94rem', color: '#64748b', marginBottom: '24px' }}>
              Purchasing bike insurance online is a quick, convenient, and hassle-free process that offers numerous advantages. Whether you're buying a new policy, renewing an existing one, or raising a claim, online bike insurance ensures a seamless experience.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚡</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Quick Process
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Skip the long queues and paperwork. You can purchase or renew your bike insurance in just a few minutes from the comfort of your home.
                </p>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚖️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Easy Comparison
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Online platforms allow you to compare multiple bike insurance policies side-by-side. Check premiums, coverage, and add-ons to make an informed decision.
                </p>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🌍</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Anytime, Anywhere
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Whether it's midnight or a weekend, you can buy or renew your bike insurance policy online without waiting for the insurer's office to open.
                </p>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⏱️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  No Waiting Period
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Receive your bike insurance policy instantly via email and WhatsApp after completing the digital purchase.
                </p>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🛡️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Add-On Covers
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Enhance your bike insurance with optional add-ons like zero depreciation, engine protection, and 24x7 emergency roadside assistance.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Checkout Modal */}
        {showCheckout && selectedQuote && (
          <CheckoutModal
            quote={selectedQuote}
            vehicleRegNo={regNo || 'MH01AE8055'}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false);
              navigate('/garage');
            }}
          />
        )}

        <Footer />
      </IonContent>
    </IonPage>
  );
};
