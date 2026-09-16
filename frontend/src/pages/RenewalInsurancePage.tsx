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
  carSportOutline,
  arrowForwardOutline,
  sparklesOutline,
  refreshOutline,
  giftOutline,
  constructOutline,
  speedometerOutline,
  walletOutline,
  copyOutline,
  checkmarkOutline,
  flashOutline,
  callOutline,
  ribbonOutline,
  shieldOutline,
} from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckoutModal } from '../components/CheckoutModal';
import { api, VehicleRecord, InsurerQuote, QuoteResponse, PolicyRecord } from '../services/api';

interface AccidentScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  totalRepair: number;
  plasticAmount: number;
  rubberAmount: number;
  glassAmount: number;
  metalAmount: number;
  fibreAmount: number;
  labourAmount: number;
}

const ACCIDENT_SCENARIOS: AccidentScenario[] = [
  {
    id: 'minor',
    name: 'Minor Fender Scratch & Dent',
    badge: '🟢 Minor Impact',
    description: 'Front mudguard scrape, broken rear-view mirror, minor bumper scratch.',
    totalRepair: 7500,
    plasticAmount: 3200,
    rubberAmount: 800,
    glassAmount: 500,
    metalAmount: 1500,
    fibreAmount: 0,
    labourAmount: 1500,
  },
  {
    id: 'moderate',
    name: 'Frontal Collision',
    badge: '🟡 Moderate Impact',
    description: 'Cracked headlamp, damaged cowl, front mudguard, radiator grill, handlebar bent.',
    totalRepair: 26000,
    plasticAmount: 10000,
    rubberAmount: 3000,
    glassAmount: 3500,
    metalAmount: 5500,
    fibreAmount: 1000,
    labourAmount: 3000,
  },
  {
    id: 'major',
    name: 'Major Crash & Side Impact',
    badge: '🟠 Major Collision',
    description: 'Shattered fairing, fuel tank dent, suspension fork damage, alloy wheel, exhaust bend.',
    totalRepair: 64000,
    plasticAmount: 22000,
    rubberAmount: 6000,
    glassAmount: 4000,
    metalAmount: 20000,
    fibreAmount: 4000,
    labourAmount: 8000,
  },
  {
    id: 'severe',
    name: 'Severe Overturn & Structural Loss',
    badge: '🔴 Severe Structural',
    description: 'Chassis distortion, windshield, engine casing guard, full panel replacement, airbag/sensors.',
    totalRepair: 135000,
    plasticAmount: 45000,
    rubberAmount: 15000,
    glassAmount: 12000,
    metalAmount: 42000,
    fibreAmount: 6000,
    labourAmount: 15000,
  },
];

const AVAILABLE_OFFERS = [
  {
    code: 'RENEW85',
    title: 'Flat 85% OFF on OD',
    discountText: 'Save up to 85% on Own Damage premium',
    badge: 'MAX SAVINGS',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'Special renewal rebate across top insurers with instant price slash.',
  },
  {
    code: 'NCB50',
    title: '50% NCB Transfer',
    discountText: 'Retain maximum 50% No Claim Bonus',
    badge: 'NCB GUARANTEE',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Keep your claim-free bonus even if your previous policy expired < 90 days ago.',
  },
  {
    code: 'ZERODEP',
    title: 'Zero-Dep Bonus Offer',
    discountText: '100% Bumper-to-Bumper Claim Cover',
    badge: 'MOST POPULAR',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Zero depreciation deduction on plastic, rubber, fibre, and metal in accidents.',
  },
  {
    code: 'CASH500',
    title: '₹500 Fuel + Free RSA',
    discountText: '₹500 Petrol Voucher & 24/7 Towing',
    badge: 'FREE PERKS',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Complimentary roadside assistance coverage and instant fuel e-voucher.',
  },
];

export const RenewalInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search and Vehicle state
  const [plateInput, setPlateInput] = useState('TN69BS3112');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Quotes state
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsurerQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<InsurerQuote | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [idvValue, setIdvValue] = useState(68000);
  const [ncbPercent, setNcbPercent] = useState(50);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['zero_dep', 'pa_cover']);

  // Offers & Coupons state
  const [appliedCoupon, setAppliedCoupon] = useState<string>('RENEW85');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string>('Coupon RENEW85 applied! Extra 15% renewal discount activated.');
  const [couponDiscountAmount, setCouponDiscountAmount] = useState<number>(250);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Accident Estimator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('moderate');
  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>('2W');
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(2); // 1-2 years = 10% metal dep
  const [customRepairAmount, setCustomRepairAmount] = useState<number>(26000);
  const [isCustomRepair, setIsCustomRepair] = useState<boolean>(false);

  const quickPlates = [
    { plate: 'TN69BS3112', label: 'Royal Enfield 350 (TN-69)' },
    { plate: 'MH01AE8055', label: 'Hunter 350 (MH-01)' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15 (DL-01)' },
    { plate: 'TN09AZ4321', label: 'Activa 6G (TN-09)' },
    { plate: 'UP32BK7711', label: 'Splendor+ (UP-32)' },
  ];

  // Load from URL or default
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const regParam = params.get('reg') || params.get('plate');
    if (regParam) {
      setPlateInput(regParam);
      handleSearch(regParam);
    } else {
      handleSearch('TN69BS3112');
    }
  }, []);

  const handleSearch = async (regToSearch?: string) => {
    const raw = (regToSearch || plateInput).trim();
    const cleanPlate = raw.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) {
      setErrorMsg('Please enter your vehicle registration number (e.g. TN69BS3112)');
      return;
    }

    setPlateInput(cleanPlate);
    setLoading(true);
    setErrorMsg('');

    try {
      const v = await api.getVehicleRC(cleanPlate);
      setVehicle(v);

      // Detect if 2W or 4W from vehicle_class or engine
      if (v.vehicle_class && (v.vehicle_class.toLowerCase().includes('car') || v.vehicle_class.toLowerCase().includes('lmv'))) {
        setVehicleType('4W');
      } else {
        setVehicleType('2W');
      }

      loadQuotesForVehicle(v, idvValue, ncbPercent, selectedAddons);
    } catch (err: any) {
      console.error('Vehicle search error:', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || `Vehicle records for "${cleanPlate}" not found.`;
      setErrorMsg(msg);
      setVehicle(null);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotesForVehicle = async (
    v: VehicleRecord,
    idv: number = 68000,
    ncb: number = 50,
    addons: string[] = ['zero_dep', 'pa_cover']
  ) => {
    setQuotesLoading(true);
    try {
      const cc = v.engine_capacity_cc || 150;
      const res: QuoteResponse = await api.getQuotes({
        engine_capacity_cc: cc,
        idv: idv,
        ncb_percent: ncb,
        selected_addons: addons,
      });

      // Enrich quotes with Renewal Offer tags & discount
      const enriched = (res.quotes || []).map((q) => {
        const renewalExtraOff = appliedCoupon === 'RENEW85' ? 250 : appliedCoupon === 'NCB50' ? 200 : appliedCoupon === 'ZERODEP' ? 300 : 150;
        const discountedTotal = Math.max(750, q.total_premium - renewalExtraOff);
        return {
          ...q,
          renewal_offer_discount: renewalExtraOff,
          renewal_final_price: discountedTotal,
        };
      });

      setQuotes(enriched as any);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return;

    if (cleanCode === 'RENEW85') {
      setAppliedCoupon('RENEW85');
      setCouponDiscountAmount(250);
      setCouponSuccessMsg('🎉 Coupon RENEW85 applied! Extra 15% Own Damage discount active.');
      triggerConfetti();
    } else if (cleanCode === 'NCB50') {
      setAppliedCoupon('NCB50');
      setNcbPercent(50);
      setCouponDiscountAmount(200);
      setCouponSuccessMsg('🛡️ Coupon NCB50 applied! 50% No Claim Bonus locked in.');
      triggerConfetti();
    } else if (cleanCode === 'ZERODEP') {
      setAppliedCoupon('ZERODEP');
      if (!selectedAddons.includes('zero_dep')) {
        setSelectedAddons([...selectedAddons, 'zero_dep']);
      }
      setCouponDiscountAmount(300);
      setCouponSuccessMsg('✨ Coupon ZERODEP applied! 100% Bumper-to-Bumper Zero-Dep discount added.');
      triggerConfetti();
    } else if (cleanCode === 'CASH500') {
      setAppliedCoupon('CASH500');
      setCouponDiscountAmount(150);
      setCouponSuccessMsg('⛽ Coupon CASH500 applied! ₹500 Fuel gift card & Free Roadside Assistance linked.');
      triggerConfetti();
    } else {
      setAppliedCoupon(cleanCode);
      setCouponDiscountAmount(100);
      setCouponSuccessMsg(`🏷️ Special Promo "${cleanCode}" applied! ₹100 instant renewal rebate.`);
      triggerConfetti();
    }

    if (vehicle) {
      loadQuotesForVehicle(vehicle, idvValue, ncbPercent, selectedAddons);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch (e) {}
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleAddon = (addonKey: string) => {
    let next: string[];
    if (selectedAddons.includes(addonKey)) {
      next = selectedAddons.filter((k) => k !== addonKey);
    } else {
      next = [...selectedAddons, addonKey];
    }
    setSelectedAddons(next);
    if (vehicle) {
      loadQuotesForVehicle(vehicle, idvValue, ncbPercent, next);
    }
  };

  // -------------------------------------------------------------
  // ACCIDENT CLAIM ESTIMATOR CALCULATIONS
  // -------------------------------------------------------------
  const activeScenario = ACCIDENT_SCENARIOS.find((s) => s.id === selectedScenarioId) || ACCIDENT_SCENARIOS[1];

  const repairBill = isCustomRepair ? customRepairAmount : activeScenario.totalRepair;

  // Scale parts based on custom repair if custom is selected
  const scaleRatio = isCustomRepair && activeScenario.totalRepair > 0 ? customRepairAmount / activeScenario.totalRepair : 1;

  const plasticParts = Math.round(activeScenario.plasticAmount * scaleRatio);
  const rubberParts = Math.round(activeScenario.rubberAmount * scaleRatio);
  const fibreParts = Math.round(activeScenario.fibreAmount * scaleRatio);
  const glassParts = Math.round(activeScenario.glassAmount * scaleRatio);
  const metalParts = Math.round(activeScenario.metalAmount * scaleRatio);
  const labourCost = Math.round(activeScenario.labourAmount * scaleRatio);

  // IRDAI Standard Depreciation Schedule
  // Plastic: 50%, Rubber: 50%, Fibre: 30%, Glass: 0%
  // Metal based on vehicle age:
  // <6mo: 0%, 6m-1yr: 5%, 1-2yr: 10%, 2-3yr: 15%, 3-4yr: 25%, 4-5yr: 35%, >5yr: 40%
  const getMetalDepPercent = (age: number) => {
    if (age <= 0.5) return 0;
    if (age <= 1) return 5;
    if (age <= 2) return 10;
    if (age <= 3) return 15;
    if (age <= 4) return 25;
    if (age <= 5) return 35;
    return 40;
  };

  const metalDepPercent = getMetalDepPercent(vehicleAgeYears);
  const compulsoryExcess = vehicleType === '2W' ? 100 : 1000;

  // 1. STANDARD COMPREHENSIVE CALCULATION
  const stdPlasticDep = Math.round(plasticParts * 0.5);
  const stdRubberDep = Math.round(rubberParts * 0.5);
  const stdFibreDep = Math.round(fibreParts * 0.3);
  const stdGlassDep = 0;
  const stdMetalDep = Math.round((metalParts * metalDepPercent) / 100);
  const stdTotalDepreciation = stdPlasticDep + stdRubberDep + stdFibreDep + stdGlassDep + stdMetalDep;

  const stdGrossApproved = repairBill - stdTotalDepreciation;
  const stdNetInsurancePayout = Math.max(0, stdGrossApproved - compulsoryExcess);
  const stdCustomerShare = Math.max(0, repairBill - stdNetInsurancePayout);

  // 2. ZERO-DEPRECIATION (BUMPER TO BUMPER) CALCULATION
  const zdTotalDepreciation = 0; // 0% depreciation on all parts
  const zdGrossApproved = repairBill - zdTotalDepreciation;
  const zdNetInsurancePayout = Math.max(0, zdGrossApproved - compulsoryExcess);
  const zdCustomerShare = Math.max(0, repairBill - zdNetInsurancePayout);

  // Net Savings if renewing with Zero-Dep
  const zeroDepSavings = zdNetInsurancePayout - stdNetInsurancePayout;

  return (
    <IonPage>
      <IonContent fullscreen className="renewal-insurance-content">
        <Header />

        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(135deg, #091e3a 0%, #1e3a8a 60%, #172554 100%)',
            padding: '50px 20px 70px',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glowing background circles */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              left: '10%',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0) 70%)',
              borderRadius: '50%',
            }}
          />

          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Pulsing Offer Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(253, 224, 71, 0.6)',
                padding: '6px 18px',
                borderRadius: '30px',
                marginBottom: '18px',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🔥</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                SPECIAL RENEWAL OFFER: UP TO 85% OFF + 50% NCB BONUS
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                margin: '0 0 14px',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.15,
              }}
            >
              Instant Vehicle Insurance Renewal
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                color: '#cbd5e1',
                maxWidth: '780px',
                margin: '0 auto 28px',
                lineHeight: 1.6,
              }}
            >
              Renew expired or expiring bike & car insurance in 2 minutes. Get <strong>Zero Physical Inspection</strong>, transfer your <strong>50% NCB</strong>, and check how much insurance claim you will get if an accident happens!
            </p>

            {/* Vehicle Plate Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              style={{
                maxWidth: '620px',
                margin: '0 auto',
                background: '#ffffff',
                padding: '8px 8px 8px 20px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* IND Emblem */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingRight: '12px',
                  borderRight: '1.5px solid #e2e8f0',
                  marginRight: '12px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '24px',
                    background: '#1e3a8a',
                    borderRadius: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.55rem',
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontSize: '0.45rem', color: '#f59e0b' }}>●</span>
                  IND
                </div>
              </div>

              <input
                type="text"
                placeholder="Enter Vehicle Plate (e.g. TN69BS3112)"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 26px',
                  borderRadius: '40px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Renew With Offer</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample Plates */}
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
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Sample vehicles:</span>
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
        <div style={{ maxWidth: '1140px', margin: '-40px auto 60px', padding: '0 16px', position: 'relative', zIndex: 10 }}>
          {/* Error notification */}
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#991b1b',
              }}
            >
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.8rem', color: '#dc2626', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.98rem' }}>Vehicle Search Note</h4>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Vehicle Snapshot Card if Loaded */}
          {vehicle && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: '1.5px solid #e2e8f0',
                overflow: 'hidden',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  background:
                    vehicle.insurance_status === 'ACTIVE'
                      ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                      : vehicle.insurance_status === 'EXPIRING_SOON'
                      ? 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)'
                      : 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                  padding: '16px 24px',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.6rem' }}>
                    {vehicle.vehicle_class?.toLowerCase().includes('car') ? '🚗' : '🛵'}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                      {vehicle.maker_model || 'Vehicle Found'} ({vehicle.registration_number})
                    </h3>
                    <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                      Owner: {vehicle.masked_owner || vehicle.owner_name} • RTO: {vehicle.rto_office}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  Policy Status: {vehicle.insurance_status} • Expiry: {vehicle.insurance_upto}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              SPECIAL OFFERS & PROMO CODES SECTION ("athula offer")
             ------------------------------------------------------------- */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              border: '1.5px solid #fef08a',
              boxShadow: '0 8px 30px rgba(234, 179, 8, 0.12)',
              marginBottom: '36px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <IonIcon icon={giftOutline} />
                  <span>EXCLUSIVE RENEWAL OFFERS & REBATES</span>
                </div>
                <h2 style={{ margin: '4px 0 6px', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  Choose Your Renewal Offer Coupon
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                  Click any coupon to apply instant savings to your live insurer quotes below.
                </p>
              </div>
            </div>

            {/* Active Coupon Banner */}
            {appliedCoupon && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#16a34a', fontSize: '1.5rem' }} />
                  <div>
                    <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.94rem' }}>
                      {couponSuccessMsg}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#166534' }}>
                      Instant renewal discount: <strong>-₹{couponDiscountAmount}</strong> applied to all quotes.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    CODE: {appliedCoupon}
                  </span>
                  <button
                    onClick={() => {
                      setAppliedCoupon('');
                      setCouponDiscountAmount(0);
                      setCouponSuccessMsg('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Offers Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {AVAILABLE_OFFERS.map((offer) => {
                const isSelected = appliedCoupon === offer.code;
                return (
                  <div
                    key={offer.code}
                    style={{
                      background: isSelected ? offer.bgColor : '#ffffff',
                      border: `1.5px solid ${isSelected ? offer.color : '#e2e8f0'}`,
                      borderRadius: '16px',
                      padding: '18px',
                      position: 'relative',
                      boxShadow: isSelected ? `0 6px 20px ${offer.color}25` : '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            background: `${offer.color}15`,
                            color: offer.color,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        >
                          {offer.badge}
                        </span>

                        <button
                          onClick={() => copyCode(offer.code)}
                          title="Copy Code"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <IonIcon icon={copiedCode === offer.code ? checkmarkOutline : copyOutline} />
                          <span>{copiedCode === offer.code ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                        {offer.title}
                      </div>

                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: offer.color, margin: '4px 0 6px' }}>
                        {offer.discountText}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 14px', lineHeight: 1.4 }}>
                        {offer.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(offer.code)}
                      style={{
                        background: isSelected ? offer.color : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        border: `1.5px solid ${isSelected ? offer.color : '#cbd5e1'}`,
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? '✓ Coupon Active' : `Apply ${offer.code}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* -------------------------------------------------------------
              ACCIDENT CLAIM PAYOUT ESTIMATOR ("accitent aguna insurance claim evolo agum")
             ------------------------------------------------------------- */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '30px',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)',
              marginBottom: '36px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <span>💥</span>
                  <span>ACCIDENT CLAIM PROTECTION CALCULATOR</span>
                </div>
                <h2 style={{ margin: '4px 0 6px', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  Accident Aana Claim Evolo Kidaikkum?
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '750px' }}>
                  Check exactly how much the insurance company pays versus what comes out of your pocket if your vehicle meets with an accident. See why renewing with <strong>Zero-Depreciation</strong> saves thousands of rupees!
                </p>
              </div>

              {/* 2-Wheeler vs 4-Wheeler Toggle */}
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '4px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setVehicleType('2W')}
                  style={{
                    background: vehicleType === '2W' ? '#2563eb' : 'transparent',
                    color: vehicleType === '2W' ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🛵</span>
                  <span>Bike (2-Wheeler)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('4W')}
                  style={{
                    background: vehicleType === '4W' ? '#2563eb' : 'transparent',
                    color: vehicleType === '4W' ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🚗</span>
                  <span>Car (4-Wheeler)</span>
                </button>
              </div>
            </div>

            {/* Accident Severity Preset Scenarios */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '10px' }}>
                Select Accident Severity Scenario:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {ACCIDENT_SCENARIOS.map((sc) => {
                  const isSelected = !isCustomRepair && selectedScenarioId === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        setIsCustomRepair(false);
                        setSelectedScenarioId(sc.id);
                        setCustomRepairAmount(sc.totalRepair);
                      }}
                      style={{
                        background: isSelected ? '#eff6ff' : '#f8fafc',
                        border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                        borderRadius: '14px',
                        padding: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#64748b' }}>
                          {sc.badge}
                        </span>
                        <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a' }}>
                          ₹{sc.totalRepair.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        {sc.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
                        {sc.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Repair Slider & Vehicle Age Bar */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '18px 22px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '26px',
              }}
            >
              {/* Slider for custom bill */}
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    Estimated Accident Repair Bill:
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>
                    ₹{repairBill.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="150000"
                  step="1000"
                  value={repairBill}
                  onChange={(e) => {
                    setIsCustomRepair(true);
                    setCustomRepairAmount(Number(e.target.value));
                  }}
                  style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                  <span>₹3,000 (Scratch)</span>
                  <span>₹75,000 (Major)</span>
                  <span>₹1,50,000 (Crash)</span>
                </div>
              </div>

              {/* Vehicle Age Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block' }}>
                    Vehicle Age:
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Metal Dep: {metalDepPercent}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { age: 0.5, label: '<6m (0%)' },
                    { age: 1, label: '1yr (5%)' },
                    { age: 2, label: '2yr (10%)' },
                    { age: 4, label: '4yr (25%)' },
                    { age: 6, label: '>5yr (40%)' },
                  ].map((item) => (
                    <button
                      key={item.age}
                      type="button"
                      onClick={() => setVehicleAgeYears(item.age)}
                      style={{
                        background: vehicleAgeYears === item.age ? '#0f172a' : '#ffffff',
                        color: vehicleAgeYears === item.age ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                SIDE-BY-SIDE PAYOUT COMPARISON (STANDARD VS ZERO-DEP)
               ------------------------------------------------------------- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* 1. Standard Policy Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                    STANDARD COMPREHENSIVE
                  </span>
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}>
                    Standard IRDAI Deductions
                  </span>
                </div>

                <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  With Standard Policy
                </h3>

                {/* Breakdown rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Total Repair Bill:</span>
                    <strong style={{ color: '#0f172a' }}>₹{repairBill.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Plastic & Rubber Dep (50% cut):</span>
                    <strong>-₹{(stdPlasticDep + stdRubberDep).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Fibre ({30}%) & Metal ({metalDepPercent}%) cut:</span>
                    <strong>-₹{(stdFibreDep + stdMetalDep).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Compulsory Deductible / Excess:</span>
                    <strong style={{ color: '#dc2626' }}>-₹{compulsoryExcess.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Final standard payout result box */}
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.88rem' }}>
                      Insurer Pays:
                    </span>
                    <span style={{ color: '#b91c1c', fontWeight: 900, fontSize: '1.3rem' }}>
                      ₹{stdNetInsurancePayout.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #fca5a5', paddingTop: '8px' }}>
                    <span style={{ color: '#7f1d1d', fontWeight: 800, fontSize: '0.88rem' }}>
                      YOU PAY FROM POCKET:
                    </span>
                    <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.25rem' }}>
                      ₹{stdCustomerShare.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Zero-Depreciation Renewal Policy Card (Highlighted) */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                  borderRadius: '18px',
                  border: '2px solid #10b981',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  RECOMMENDED RENEWAL
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                    ZERO-DEPRECIATION (BUMPER TO BUMPER)
                  </span>
                  <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem' }}>
                    0% Depreciation Cut!
                  </span>
                </div>

                <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
                  With Zero-Dep Plan
                </h3>

                {/* Breakdown rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Total Repair Bill:</span>
                    <strong style={{ color: '#0f172a' }}>₹{repairBill.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Plastic, Rubber & Fibre Dep:</span>
                    <strong>₹0 (100% Covered!)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Metal Parts Depreciation:</span>
                    <strong>₹0 (100% Covered!)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Compulsory Deductible / Excess:</span>
                    <strong style={{ color: '#dc2626' }}>-₹{compulsoryExcess.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Final zero dep payout result box */}
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #6ee7b7',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#065f46', fontWeight: 700, fontSize: '0.88rem' }}>
                      Insurer Pays:
                    </span>
                    <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.3rem' }}>
                      ₹{zdNetInsurancePayout.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #a7f3d0', paddingTop: '8px' }}>
                    <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.88rem' }}>
                      YOU PAY FROM POCKET:
                    </span>
                    <span style={{ color: '#065f46', fontWeight: 900, fontSize: '1.25rem' }}>
                      ₹{zdCustomerShare.toLocaleString('en-IN')} (Only Excess)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Callout Banner */}
            <div
              style={{
                background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
                borderRadius: '14px',
                padding: '16px 20px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    You Save ₹{zeroDepSavings.toLocaleString('en-IN')} with Zero-Dep Plan in this accident!
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.9 }}>
                    A Zero-Dep addon costs just ~₹350/year to renew, but saves you over ₹{zeroDepSavings.toLocaleString('en-IN')} during an accident claim.
                  </p>
                </div>
              </div>

              <a
                href="#compare-plans"
                style={{
                  background: '#fef08a',
                  color: '#854d0e',
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Renew with Zero-Dep Now ↓
              </a>
            </div>
          </div>

          {/* -------------------------------------------------------------
              COMPARE LIVE RENEWAL QUOTES (TOP INSURERS)
             ------------------------------------------------------------- */}
          <div id="compare-plans" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  TOP IRDAI-APPROVED INSURERS
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  Compare Renewal Quotes for {vehicle?.registration_number || 'Your Vehicle'}
                </h3>
              </div>

              {/* Addon Selector Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'zero_dep', label: 'Zero Depreciation' },
                  { key: 'pa_cover', label: 'PA Cover (₹15L)' },
                  { key: 'engine_protect', label: 'Engine Protection' },
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
                        border: `1.5px solid ${isChecked ? '#3b82f6' : '#cbd5e1'}`,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <IonIcon icon={isChecked ? checkmarkCircleOutline : refreshOutline} />
                      <span>{addon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insurer Quote Cards Grid */}
            {quotesLoading ? (
              <div style={{ textAlign: 'center', padding: '50px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <IonSpinner name="crescent" style={{ width: '36px', height: '36px', color: '#2563eb' }} />
                <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.96rem', fontWeight: 600 }}>
                  Calculating customized renewal quotes with {appliedCoupon} offer discount...
                </p>
              </div>
            ) : quotes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
                {quotes.map((q: any) => (
                  <div
                    key={q.insurer_id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '24px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span
                        style={{
                          background: `${q.brand_color}15`,
                          color: q.brand_color,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '20px',
                        }}
                      >
                        {q.tag}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a' }}>
                        CSR: {q.claim_settlement_ratio}
                      </span>
                    </div>

                    {/* Insurer Name & IDV */}
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                        {q.short_name}
                      </h4>
                      <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#64748b' }}>
                        IDV Value: <strong>₹{q.idv?.toLocaleString('en-IN')}</strong> • 4,800+ Garages
                      </p>

                      {/* Cashless claim guarantee pill */}
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          marginBottom: '16px',
                          fontSize: '0.78rem',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#059669', fontSize: '1rem' }} />
                        <span>Instant Cashless Settlement</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      {appliedCoupon && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#059669', marginBottom: '4px', fontWeight: 700 }}>
                          <span>Offer ({appliedCoupon}):</span>
                          <span>-₹{couponDiscountAmount}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Renewal Premium:</span>
                        <div style={{ textAlign: 'right' }}>
                          {appliedCoupon && (
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: '6px' }}>
                              ₹{q.total_premium}
                            </span>
                          )}
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                            ₹{Math.max(650, q.total_premium - couponDiscountAmount)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQuote(q);
                          setShowCheckout(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                        }}
                      >
                        <span>Renew Now</span>
                        <IonIcon icon={arrowForwardOutline} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>No live quotes currently available. Please search with a valid registration number.</p>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              WHY RENEW NOW & ZERO INSPECTION PERKS GRID
             ------------------------------------------------------------- */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '30px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', fontFamily: 'Outfit' }}>
              Why Renew on VehicleInfo?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                {
                  icon: '⚡',
                  title: 'Zero Physical Inspection',
                  text: 'Renew expired policy in under 2 minutes without photos or agent visits (expired <90 days).',
                },
                {
                  icon: '🛡️',
                  title: '50% NCB Transfer',
                  text: 'Retain your hard-earned No Claim Bonus even when switching to any new insurer.',
                },
                {
                  icon: '🚗',
                  title: 'Avoid ₹2,000 Fines',
                  text: 'Driving without valid insurance attracts a ₹2,000 fine (₹4,000 for 2nd offense) under MVA.',
                },
                {
                  icon: '🔧',
                  title: '4,800+ Cashless Garages',
                  text: 'Enjoy cashless accident repairs across all authorized dealership networks in India.',
                },
              ].map((perk, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>{perk.icon}</span>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{perk.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>{perk.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckout && selectedQuote && (
          <CheckoutModal
            quote={selectedQuote}
            vehicleRegNo={vehicle?.registration_number || plateInput}
            onClose={() => setShowCheckout(false)}
            onSuccess={(policy: PolicyRecord) => {
              setShowCheckout(false);
              triggerConfetti();
              navigate('/garage');
            }}
          />
        )}

        <Footer />
      </IonContent>
    </IonPage>
  );
};
