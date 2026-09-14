import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  documentTextOutline,
  downloadOutline,
  notificationsOutline,
  carSportOutline,
  speedometerOutline,
  businessOutline,
  calendarOutline,
  arrowForwardOutline,
  checkmarkOutline,
  refreshOutline,
} from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckoutModal } from '../components/CheckoutModal';
import { api, VehicleRecord, InsurerQuote, QuoteResponse } from '../services/api';
import { generateInsuranceStatusPDF } from '../services/pdfGenerator';

export const CheckInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [plateInput, setPlateInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [reminderSaved, setReminderSaved] = useState(false);

  // Quotes comparison state
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsurerQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<InsurerQuote | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [idvValue, setIdvValue] = useState(65000);
  const [ncbPercent, setNcbPercent] = useState(20);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['zero_dep', 'pa_cover']);

  const quickPlates = [
    { plate: 'TN69BS3112', label: 'Royal Enfield 350 (TN-69)' },
    { plate: 'MH01AE8055', label: 'Hunter 350 (MH-01)' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15 (DL-01)' },
    { plate: 'TN09AZ4321', label: 'Activa 6G (TN-09)' },
    { plate: 'UP32BK7711', label: 'Splendor+ (UP-32)' },
  ];

  // Check query params if plate is passed in URL, e.g. /check-insurance?reg=TN69BS3112
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const regParam = params.get('reg') || params.get('plate');
    if (regParam) {
      setPlateInput(regParam);
      handleSearch(regParam);
    } else {
      // Default to TN69BS3112 as primary test
      handleSearch('TN69BS3112');
    }
  }, []);

  const handleSearch = async (regToSearch?: string) => {
    const raw = (regToSearch || plateInput).trim();
    const cleanPlate = raw.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) {
      setErrorMsg('Please enter a vehicle registration number (e.g. TN69BS3112)');
      return;
    }

    setPlateInput(cleanPlate);
    setLoading(true);
    setErrorMsg('');
    setReminderSaved(false);

    try {
      const v = await api.getVehicleRC(cleanPlate);
      setVehicle(v);

      // Load quotes for this vehicle
      loadQuotesForVehicle(v);
    } catch (err: any) {
      console.error('Insurance check error:', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || `Vehicle records for "${cleanPlate}" not found.`;
      setErrorMsg(msg);
      setVehicle(null);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotesForVehicle = async (v: VehicleRecord) => {
    setQuotesLoading(true);
    try {
      const cc = v.engine_capacity_cc || 150;
      const initialIdv = cc > 300 ? 110000 : cc > 125 ? 75000 : 45000;
      setIdvValue(initialIdv);

      const qRes = await api.getQuotes({
        engine_capacity_cc: cc,
        idv: initialIdv,
        ncb_percent: ncbPercent,
        selected_addons: selectedAddons,
      });
      setQuotes(qRes.quotes);
    } catch (err) {
      console.error('Quotes calculation error:', err);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleRecalculateQuotes = async (newIdv: number, newNcb: number, newAddons: string[]) => {
    if (!vehicle) return;
    setQuotesLoading(true);
    try {
      const qRes = await api.getQuotes({
        engine_capacity_cc: vehicle.engine_capacity_cc || 150,
        idv: newIdv,
        ncb_percent: newNcb,
        selected_addons: newAddons,
      });
      setQuotes(qRes.quotes);
    } catch (err) {
      console.error('Failed to recalculate quotes:', err);
    } finally {
      setQuotesLoading(false);
    }
  };

  const toggleAddon = (key: string) => {
    const updated = selectedAddons.includes(key)
      ? selectedAddons.filter((k) => k !== key)
      : [...selectedAddons, key];
    setSelectedAddons(updated);
    handleRecalculateQuotes(idvValue, ncbPercent, updated);
  };

  const handleDownloadPDF = () => {
    if (!vehicle) return;
    generateInsuranceStatusPDF(vehicle);
  };

  const handleSetReminder = () => {
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 5000);
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen style={{ '--background': 'linear-gradient(180deg, #ffffff 0%, #fffdf0 20%, #fefce8 60%, #fef9c3 100%)' }}>
        {/* Top Hero Banner in White & Radiant Yellow Shade */}
        <section
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fffdf0 25%, #fef9c3 55%, #fef08a 85%, #fde047 100%)',
            color: '#0f172a',
            padding: '50px 20px 70px',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '2px solid #facc15',
            boxShadow: '0 10px 30px rgba(234, 179, 8, 0.08)',
          }}
        >
          {/* Subtle Background Glow Rings */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-60px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253, 224, 71, 0.35) 0%, rgba(253, 224, 71, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(254, 240, 138, 0.85)',
                border: '1.5px solid #eab308',
                padding: '6px 16px',
                borderRadius: '30px',
                color: '#854d0e',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '18px',
              }}
            >
              <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '1rem', color: '#b45309' }} />
              <span>OFFICIAL PARIVAHAN MOTOR INSURANCE VERIFIER</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.2,
                marginBottom: '14px',
              }}
            >
              Check Vehicle Insurance Status Online
            </h1>
            <p
              style={{
                fontSize: '1.05rem',
                color: '#475569',
                maxWidth: '680px',
                margin: '0 auto 28px',
                lineHeight: 1.5,
              }}
            >
              Verify real-time insurance validity, policy expiry date, insurer details, and legal compliance directly from the central Vahan registry.
            </p>

            {/* Indian Number Plate Search Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              style={{
                maxWidth: '640px',
                margin: '0 auto',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                border: '3px solid #e2e8f0',
              }}
            >
              {/* IND Emblem */}
              <div
                style={{
                  background: '#f1f5f9',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #cbd5e1',
                  marginRight: '8px',
                  userSelect: 'none',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', marginBottom: '2px' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.05em' }}>IND</span>
              </div>

              {/* Text Input */}
              <input
                type="text"
                placeholder="ENTER VEHICLE NUMBER (e.g. TN69BS3112)"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.08em',
                  color: '#0f172a',
                  padding: '10px 8px',
                  background: 'transparent',
                }}
              />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  transition: 'transform 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Check Status</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample Plate Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '18px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Quick samples:</span>
              {quickPlates.map((item) => (
                <button
                  key={item.plate}
                  type="button"
                  onClick={() => {
                    setPlateInput(item.plate);
                    handleSearch(item.plate);
                  }}
                  style={{
                    background: plateInput === item.plate ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div style={{ maxWidth: '1080px', margin: '-40px auto 60px', padding: '0 16px', position: 'relative', zIndex: 10 }}>
          {/* Error Message if lookup failed */}
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#991b1b',
              }}
            >
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '2rem', color: '#dc2626', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1rem' }}>Vehicle Records Not Found</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Vehicle Insurance Verification Card */}
          {vehicle && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                marginBottom: '36px',
              }}
            >
              {/* Header Status Bar */}
              <div
                style={{
                  background:
                    vehicle.insurance_status === 'ACTIVE'
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : vehicle.insurance_status === 'EXPIRING_SOON'
                      ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  padding: '20px 28px',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IonIcon
                      icon={
                        vehicle.insurance_status === 'ACTIVE'
                          ? checkmarkCircleOutline
                          : vehicle.insurance_status === 'EXPIRING_SOON'
                          ? timeOutline
                          : alertCircleOutline
                      }
                      style={{ fontSize: '1.8rem', color: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9, fontWeight: 700 }}>
                      INSURANCE VALIDITY STATUS
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.insurance_status === 'ACTIVE'
                        ? 'Insurance is Active & Valid'
                        : vehicle.insurance_status === 'EXPIRING_SOON'
                        ? 'Insurance Expiring Soon'
                        : 'Insurance Has Expired'}
                    </h3>
                  </div>
                </div>

                {/* Expiry Pill */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                  }}
                >
                  {vehicle.days_to_insurance_expiry > 0
                    ? `${vehicle.days_to_insurance_expiry} Days Remaining`
                    : 'Expired - Renew Now'}
                </div>
              </div>

              {/* Main Vehicle & Policy Grid */}
              <div style={{ padding: '28px' }}>
                {/* Vehicle Title & Plate Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      <span style={{ color: '#2563eb', fontSize: '0.75rem' }}>IND</span>
                      <span>{vehicle.registration_number}</span>
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.maker_model}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.88rem' }}>
                      <IonIcon icon={businessOutline} style={{ color: '#2563eb' }} />
                      <span>{vehicle.rto_office}</span>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleDownloadPDF}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.15s',
                      }}
                    >
                      <IonIcon icon={downloadOutline} style={{ color: '#2563eb', fontSize: '1.1rem' }} />
                      <span>Download Slip (PDF)</span>
                    </button>

                    <button
                      onClick={handleSetReminder}
                      style={{
                        background: reminderSaved ? '#ecfdf5' : '#eff6ff',
                        border: `1px solid ${reminderSaved ? '#a7f3d0' : '#bfdbfe'}`,
                        color: reminderSaved ? '#065f46' : '#1d4ed8',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <IonIcon icon={reminderSaved ? checkmarkOutline : notificationsOutline} style={{ fontSize: '1.1rem' }} />
                      <span>{reminderSaved ? 'Reminder Set!' : 'Set Renewal Alert'}</span>
                    </button>
                  </div>
                </div>

                {/* Key Insurance Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px',
                  }}
                >
                  {/* Card 1: Insurance Valid Upto */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      <IonIcon icon={calendarOutline} style={{ color: '#2563eb' }} />
                      <span>Insurance Valid Upto</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: vehicle.insurance_status === 'ACTIVE' ? '#059669' : '#dc2626', fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.insurance_upto || 'Expired / Not Available'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      {vehicle.days_to_insurance_expiry > 0
                        ? `Expires in ${vehicle.days_to_insurance_expiry} days`
                        : 'Immediate renewal advised'}
                    </div>
                  </div>

                  {/* Card 2: Engine Capacity */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      <IonIcon icon={speedometerOutline} style={{ color: '#2563eb' }} />
                      <span>Engine Displacement</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.engine_capacity_cc} CC
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      IRDAI Class: {vehicle.engine_capacity_cc > 350 ? '> 350cc (₹2,804 TP)' : vehicle.engine_capacity_cc > 150 ? '150-350cc (₹1,366 TP)' : '75-150cc (₹714 TP)'}
                    </div>
                  </div>

                  {/* Card 3: Registered Owner */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      <IonIcon icon={carSportOutline} style={{ color: '#2563eb' }} />
                      <span>Owner Name</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.masked_owner || vehicle.owner_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      Parivahan Verified Owner
                    </div>
                  </div>

                  {/* Card 4: Registration Date & Age */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      <IonIcon icon={documentTextOutline} style={{ color: '#2563eb' }} />
                      <span>Registration Date</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      {vehicle.registration_date}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      Fitness upto: {vehicle.fitness_upto}
                    </div>
                  </div>
                </div>

                {/* Additional Statutory Checklist */}
                <div
                  style={{
                    background: '#f1f5f9',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '1.2rem' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                        PUCC Status: {vehicle.pucc_upto ? `Valid upto ${vehicle.pucc_upto}` : 'Active & Certified'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '1.2rem' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                        RC Status: {vehicle.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={vehicle.pending_challans_count === 0 ? checkmarkCircleOutline : alertCircleOutline} style={{ color: vehicle.pending_challans_count === 0 ? '#10b981' : '#f59e0b', fontSize: '1.2rem' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                        Challans: {vehicle.pending_challans_count === 0 ? 'No Pending Fines (0 Clean)' : `${vehicle.pending_challans_count} Fines (₹${vehicle.pending_fines_total})`}
                      </span>
                    </div>
                  </div>

                  <a
                    href="#compare-quotes"
                    style={{
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View Renewal Plans</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Instant Insurance Renewal & Comparison Section */}
          <div id="compare-quotes" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  INSTANT POLICY ISSUANCE
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  Compare Live Insurance Quotes for {vehicle?.registration_number || 'Your Vehicle'}
                </h3>
              </div>

              {/* NCB Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>No Claim Bonus (NCB):</span>
                {[0, 20, 35, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setNcbPercent(pct);
                      handleRecalculateQuotes(idvValue, pct, selectedAddons);
                    }}
                    style={{
                      background: ncbPercent === pct ? '#2563eb' : '#ffffff',
                      color: ncbPercent === pct ? '#ffffff' : '#334155',
                      border: `1px solid ${ncbPercent === pct ? '#2563eb' : '#cbd5e1'}`,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Addons Bar */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Recommended Covers:</span>
              {[
                { key: 'zero_dep', label: 'Zero Depreciation' },
                { key: 'pa_cover', label: 'Personal Accident (₹15L)' },
                { key: 'engine_protect', label: 'Engine Protection' },
                { key: 'rti', label: 'Return to Invoice (RTI)' },
              ].map((addon) => {
                const isChecked = selectedAddons.includes(addon.key);
                return (
                  <button
                    key={addon.key}
                    type="button"
                    onClick={() => toggleAddon(addon.key)}
                    style={{
                      background: isChecked ? '#eff6ff' : '#f8fafc',
                      color: isChecked ? '#1d4ed8' : '#475569',
                      border: `1.5px solid ${isChecked ? '#3b82f6' : '#e2e8f0'}`,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <IonIcon icon={isChecked ? checkmarkCircleOutline : refreshOutline} style={{ color: isChecked ? '#2563eb' : '#94a3b8' }} />
                    <span>{addon.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Insurer Quote Cards Grid */}
            {quotesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <IonSpinner name="crescent" style={{ width: '32px', height: '32px', color: '#2563eb' }} />
                <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Fetching live quotes across 4 insurers...</p>
              </div>
            ) : quotes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {quotes.map((q) => (
                  <div
                    key={q.insurer_id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '22px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* Top Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span
                        style={{
                          background: `${q.brand_color}18`,
                          color: q.brand_color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '20px',
                        }}
                      >
                        {q.tag}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                        CSR: {q.claim_settlement_ratio}
                      </span>
                    </div>

                    {/* Insurer Name */}
                    <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      {q.short_name}
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      {q.highlight}
                    </p>

                    {/* Cashless garages */}
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🏬</span>
                      <span>{q.cashless_garages} Cashless Garages</span>
                    </div>

                    {/* Price & CTA */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Premium (incl. GST):</span>
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                          ₹{Math.round(q.total_premium)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedQuote(q);
                          setShowCheckout(true);
                        }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        <span>Renew / Buy Policy</span>
                        <IonIcon icon={arrowForwardOutline} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                Search a vehicle registration above to calculate real-time insurance quotes.
              </div>
            )}
          </div>

          {/* Legal Information & Penalties Guidance */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 30px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={alertCircleOutline} style={{ color: '#dc2626', fontSize: '1.4rem' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  Section 196 Motor Vehicles Act: Penalties for Driving Uninsured
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Government of India Statutory Enforcement Guidelines</span>
              </div>
            </div>

            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Under <strong>Section 146 of the Motor Vehicles Act, 1988</strong>, having at least a valid Third-Party Liability insurance policy is legally mandatory for all motor vehicles operating on public roads in India. Operating an uninsured vehicle leads to strict traffic penalties under Section 196:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem', marginBottom: '6px' }}>1st Offense Penalty</div>
                <div style={{ fontSize: '0.9rem', color: '#b91c1c' }}>₹2,000 traffic fine and/or imprisonment of up to 3 months.</div>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem', marginBottom: '6px' }}>Repeat Offenses Penalty</div>
                <div style={{ fontSize: '0.9rem', color: '#b91c1c' }}>₹4,000 traffic fine and/or imprisonment of up to 3 months.</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.1rem', marginBottom: '6px' }}>Instant Digital Immunity</div>
                <div style={{ fontSize: '0.9rem', color: '#15803d' }}>Renewing your policy online grants immediate digital certificate valid for mParivahan and Digilocker.</div>
              </div>
            </div>

            {/* FAQ Accordion Items */}
            <h4 style={{ margin: '24px 0 14px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Frequently Asked Questions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>
                  How long does it take for renewed insurance to reflect on Parivahan?
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  Insurer servers synchronize with IIB (Insurance Information Bureau) within 24 to 48 hours of policy issuance. Your digital policy schedule issued through our vault is immediately valid for traffic police inspection.
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>
                  Can I renew insurance without a physical inspection?
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  Yes! For two-wheelers and cars within the standard renewal grace period, our platform provides zero physical inspection, self-inspection video upload, and instant digital policy issuance under 2 minutes.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckout && selectedQuote && vehicle && (
          <CheckoutModal
            quote={selectedQuote}
            vehicleRegNo={vehicle.registration_number}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false);
              handleSearch(vehicle.registration_number);
            }}
          />
        )}

        <Footer />
      </IonContent>
    </IonPage>
  );
};
