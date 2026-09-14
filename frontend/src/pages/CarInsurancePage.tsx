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
import { api, VehicleRecord, InsurerQuote } from '../services/api';

export const CarInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsurerQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<InsurerQuote | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQuotesList, setShowQuotesList] = useState(false);

  const samplePlates = ['MH01AE8055', 'DL01AB1234', 'TN09AZ4321', 'KA05MH9999'];

  const handleCheckInsurance = async (plateToSearch?: string) => {
    const rawPlate = (plateToSearch || regNo).trim();
    const cleanPlate = rawPlate.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) {
      setErrorMsg('Please enter your car registration number');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Fetch vehicle specs or fallback
      let cc = 1197;
      try {
        const v = await api.getVehicleRC(cleanPlate);
        cc = v.engine_capacity_cc || 1197;
      } catch {
        // use standard car defaults
      }

      const qRes = await api.getQuotes({
        engine_capacity_cc: cc,
        idv: 450000,
        ncb_percent: 20,
        selected_addons: ['zero_dep', 'roadside_assist'],
      });

      setQuotes(qRes.quotes);
      setShowQuotesList(true);
    } catch (err) {
      console.error('Failed to get car quotes:', err);
      setErrorMsg('Unable to retrieve insurance quotes. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {/* Background Watermark Car Silhouette */}
            <div
              style={{
                position: 'absolute',
                right: '28%',
                bottom: '-25px',
                opacity: 0.12,
                pointerEvents: 'none',
              }}
            >
              <svg width="450" height="250" viewBox="0 0 24 24" fill="#ca8a04">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
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
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Car Insurance in India - Buy, Renew & Compare Policies Online
              </h1>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#fef08a',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '1px solid #fde047',
                  boxShadow: '0 2px 8px rgba(202, 138, 4, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>✨</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#854d0e' }}>
                  Save up to 91% on Car Insurance
                </span>
              </div>
            </div>

            {/* Right Column: White Card matching Screenshot 2 */}
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

          {/* Instant Insurance Quotes Result Drawer (if searched) */}
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
                    Available Car Insurance Plans ({quotes.length} Insurers)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Registration: <strong>{regNo || 'MH01AE8055'}</strong> • IDV: ₹4,50,000 • NCB: 20%
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
                        Zero Dep included • 4,200+ Cashless Garages
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

          {/* Content Section: What is Car Insurance? matching Screenshot 2 */}
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
                  What is Car Insurance?
                </h2>

                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, marginBottom: '14px' }}>
                  Car insurance, also known as motor or auto insurance, is a protective policy that provides financial coverage if your vehicle faces damages due to accidents, theft, natural disasters, or third-party liabilities. It acts as a financial shield, ensuring that you are safe from unexpected expenses arising from such incidents.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, marginBottom: '14px' }}>
                  A Comprehensive Car Insurance Policy offers extensive coverage, including protection for own-vehicle damages and third-party liabilities, helps you to stay legally compliant while driving. On the other hand, a Third-Party Car Insurance Policy is mandatory by law and covers damages or injuries caused to another person, vehicle, or property.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7 }}>
                  The premium for car insurance depends on various factors, including the insured declared value (IDV), type of coverage, deductibles, and vehicle classification. With the rise of online insurance platforms, comparing policies, customizing coverage, and buying or renewing car insurance online has become effortless.
                </p>
              </div>

              {/* Right Illustration: Car with Policy and Insured Person */}
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
                  {/* Background Shield */}
                  <path
                    d="M160 20L80 50V120C80 170 160 210 160 210C160 210 240 170 240 120V50L160 20Z"
                    fill="#eff6ff"
                    stroke="#93c5fd"
                    strokeWidth="2"
                  />
                  {/* Document Board */}
                  <rect x="190" y="40" width="90" height="130" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="202" y="55" width="66" height="8" rx="2" fill="#2563eb" />
                  <rect x="202" y="72" width="50" height="4" rx="2" fill="#94a3b8" />
                  <rect x="202" y="82" width="60" height="4" rx="2" fill="#cbd5e1" />
                  <rect x="202" y="92" width="45" height="4" rx="2" fill="#cbd5e1" />
                  {/* Green Verified Circle */}
                  <circle cx="185" cy="115" r="14" fill="#10b981" />
                  <path d="M179 115L183 119L191 111" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Yellow Modern Car */}
                  <g transform="translate(40, 105)">
                    {/* Shadow */}
                    <ellipse cx="90" cy="85" rx="70" ry="10" fill="#cbd5e1" opacity="0.6" />
                    {/* Car Body */}
                    <path
                      d="M20 60L45 35H125L155 60H165V78H15V60H20Z"
                      fill="#eab308"
                    />
                    <path
                      d="M48 38L32 58H85V38H48Z"
                      fill="#38bdf8"
                      opacity="0.8"
                    />
                    <path
                      d="M92 38V58H142L122 38H92Z"
                      fill="#38bdf8"
                      opacity="0.8"
                    />
                    {/* Wheels */}
                    <circle cx="45" cy="78" r="14" fill="#1e293b" />
                    <circle cx="45" cy="78" r="6" fill="#e2e8f0" />
                    <circle cx="135" cy="78" r="14" fill="#1e293b" />
                    <circle cx="135" cy="78" r="6" fill="#e2e8f0" />
                    {/* Headlight */}
                    <polygon points="160,63 168,67 160,70" fill="#fef08a" />
                  </g>

                  {/* Happy Person Character */}
                  <g transform="translate(225, 110)">
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

          {/* Key Features of Online Car Insurance matching Screenshot 2 */}
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
              Key Features of Online Car Insurance
            </h2>

            <p style={{ fontSize: '0.94rem', color: '#64748b', marginBottom: '24px' }}>
              Buying car insurance online for cars is super easy, cost-effective, and seamless nowadays. You can get your car insured in just three simple steps against damages caused by accidents, theft, fire, natural disasters, and third-party liabilities.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>💰</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Affordable Premiums
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Removing the middlemen and reducing operational costs allows online insurers to offer low premium insurance. With no agent commissions, you can access policies at competitive rates while also benefiting from exclusive online discounts.
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
                <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>📄</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Zero Paperwork
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Say goodbye to long forms and physical documents. Online car insurance eliminates the need for excessive paperwork, making the entire process—from purchasing to renewal—fast and hassle-free.
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
                <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>⚡</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Quick & Easy Claim Process
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Experience frictionless cashless claim settlements across 4,500+ network garages all across India. Digital inspection and direct claim approvals ensure you get back on the road in no time.
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
