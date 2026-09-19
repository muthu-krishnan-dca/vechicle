import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  searchOutline,
  warningOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  checkmarkCircle,
  speedometerOutline,
  carOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

export type RulesTabType = 'insurance' | 'road_rules' | 'traffic_rules';

interface TrafficRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: RulesTabType;
}

interface PenaltyItem {
  offense: string;
  category: 'Safety' | 'Documentation' | 'Driving Violation' | 'Pollution & Vehicle';
  oldFine: string;
  newFine: string;
  section: string;
  repeatOffense?: string;
  suspension?: string;
}

interface RoadRuleItem {
  title: string;
  category: 'Lane & Overtaking' | 'Speed Limits' | 'Pedestrian & Junction' | 'Night & Emergency';
  icon: string;
  ruleDesc: string;
  bestPractice: string;
  legalNotice: string;
}

interface InsuranceBenefitItem {
  title: string;
  badge: string;
  icon: string;
  shortDesc: string;
  details: string[];
  savingsExample: string;
  actionLabel?: string;
  actionPath?: string;
}

const PENALTIES_DATA: PenaltyItem[] = [
  {
    offense: 'Riding without Helmet (Driver or Pillion)',
    category: 'Safety',
    oldFine: '₹100',
    newFine: '₹1,000',
    section: 'Section 194D',
    repeatOffense: 'License disqualified for 3 months',
    suspension: '3 Months License Suspension',
  },
  {
    offense: 'Driving without Seatbelt',
    category: 'Safety',
    oldFine: '₹100',
    newFine: '₹1,000',
    section: 'Section 194B',
  },
  {
    offense: 'Drunken Driving (DUI / Alcohol > 30mg per 100ml)',
    category: 'Driving Violation',
    oldFine: '₹2,000',
    newFine: '₹10,000 & / or 6 months jail',
    section: 'Section 185',
    repeatOffense: '₹15,000 fine and up to 2 years imprisonment',
  },
  {
    offense: 'Jumping Red Light (Signal Jump)',
    category: 'Driving Violation',
    oldFine: '₹100 - ₹500',
    newFine: '₹1,000 - ₹5,000',
    section: 'Section 184',
    repeatOffense: '₹10,000 or license seizure',
  },
  {
    offense: 'Over Speeding (Light Motor Vehicle - LMV Car / Bike)',
    category: 'Driving Violation',
    oldFine: '₹400',
    newFine: '₹1,000 - ₹2,000',
    section: 'Section 183(1)',
  },
  {
    offense: 'Over Speeding (Medium / Heavy Commercial Vehicle)',
    category: 'Driving Violation',
    oldFine: '₹400',
    newFine: '₹2,000 - ₹4,000',
    section: 'Section 183(2)',
    repeatOffense: 'Impound of Driving License',
  },
  {
    offense: 'Driving without Valid Driving License (DL)',
    category: 'Documentation',
    oldFine: '₹500',
    newFine: '₹5,000',
    section: 'Section 181',
  },
  {
    offense: 'Driving without Valid Vehicle Insurance',
    category: 'Documentation',
    oldFine: '₹1,000',
    newFine: '₹2,000 (1st) / ₹4,000 (2nd)',
    section: 'Section 196',
    repeatOffense: '3 months imprisonment or ₹4,000 fine',
  },
  {
    offense: 'Using Mobile Phone while Driving',
    category: 'Driving Violation',
    oldFine: '₹1,000',
    newFine: '₹1,000 - ₹5,000',
    section: 'Section 184(c)',
  },
  {
    offense: 'Driving without Pollution Under Control (PUC)',
    category: 'Pollution & Vehicle',
    oldFine: '₹1,000',
    newFine: '₹10,000',
    section: 'Section 190(2)',
    repeatOffense: 'Disqualification of RC for 3 months',
  },
  {
    offense: 'Triple Riding on Two Wheeler',
    category: 'Safety',
    oldFine: '₹100',
    newFine: '₹1,000',
    section: 'Section 194C',
    suspension: '3 Months License Suspension',
  },
  {
    offense: 'Dangerous / Rash Driving',
    category: 'Driving Violation',
    oldFine: '₹1,000',
    newFine: '₹1,000 - ₹5,000 & / or 6 months jail',
    section: 'Section 184',
    repeatOffense: '₹10,000 and/or 2 years jail',
  },
  {
    offense: 'Not Giving Way to Emergency Vehicles (Ambulance/Fire)',
    category: 'Safety',
    oldFine: 'None',
    newFine: '₹10,000 & / or 6 months jail',
    section: 'Section 194E',
  },
  {
    offense: 'Overloading of Passenger Vehicles',
    category: 'Safety',
    oldFine: 'None',
    newFine: '₹1,000 per extra passenger',
    section: 'Section 194A',
  },
  {
    offense: 'Unauthorized Vehicle Alteration / Modified Loud Silencer',
    category: 'Pollution & Vehicle',
    oldFine: '₹1,000',
    newFine: '₹5,000 fine per alteration',
    section: 'Section 182A(4)',
  },
];

const ROAD_RULES_DATA: RoadRuleItem[] = [
  {
    title: 'Right-Hand Overtaking Only',
    category: 'Lane & Overtaking',
    icon: '🏎️',
    ruleDesc: 'In India, vehicles drive on the left side of the road and MUST overtake only from the right side of the vehicle ahead.',
    bestPractice: 'Indicate right before overtaking, check blind spots, ensure a clear view of oncoming traffic, and never overtake at bends, bridges, or intersections.',
    legalNotice: 'Overtaking from the left (undertaking) is a punishable offense under Section 184 for dangerous driving.',
  },
  {
    title: 'National Speed Limits Norms',
    category: 'Speed Limits',
    icon: '⚡',
    ruleDesc: 'Official MoRTH Maximum Speed Limits: Urban/City roads: 50 km/h | 4-Lane State Highways: 80 km/h | 6-8 Lane National Expressways: 120 km/h.',
    bestPractice: 'Always slow down to under 30 km/h near school zones, hospitals, construction sites, and residential intersections.',
    legalNotice: 'Speed cameras automatically issue Section 183 challans for speeds exceeding calibrated radar limits.',
  },
  {
    title: 'Pedestrian Priority at Zebra Crossings',
    category: 'Pedestrian & Junction',
    icon: '🚶',
    ruleDesc: 'Pedestrians have absolute right-of-way on marked zebra crossings. Drivers must bring their vehicle to a complete stop before the white stop line.',
    bestPractice: 'Do not overtake any vehicle that has stopped at a pedestrian crossing to let someone cross.',
    legalNotice: 'Failing to yield to pedestrians carries a ₹1,000 penalty under the MV Amendment Act.',
  },
  {
    title: 'Roundabout & Junction Give-Way Rule',
    category: 'Pedestrian & Junction',
    icon: '🔄',
    ruleDesc: 'Vehicles approaching a roundabout must yield and give way to traffic already circulating inside the roundabout coming from the right.',
    bestPractice: 'Signal left if taking the first exit, remain in the outer lane for immediate turns, and signal right when continuing around the circle.',
    legalNotice: 'Cutting off circulating traffic in roundabouts constitutes rash driving under Section 184.',
  },
  {
    title: '3-Second Safe Following Distance Rule',
    category: 'Lane & Overtaking',
    icon: '📏',
    ruleDesc: 'Always maintain a minimum 3-second distance between your vehicle and the vehicle directly in front to ensure safe emergency braking buffer.',
    bestPractice: 'Increase to 5-6 seconds during heavy rainfall, fog, nighttime driving, or on wet highway surfaces.',
    legalNotice: 'Tailgating is the primary cause of highway multi-vehicle pileups and voids contributory negligence defenses.',
  },
  {
    title: 'Night Driving High Beam Etiquette',
    category: 'Night & Emergency',
    icon: '💡',
    ruleDesc: 'High beams must be switched to Low Beams whenever approaching within 200 meters of an oncoming vehicle or when driving behind another vehicle.',
    bestPractice: 'Never use high beams inside illuminated city roads or dense fog (high beams reflect back in fog, blinding the driver).',
    legalNotice: 'Dazzling oncoming drivers with continuous high beam is penalized under Section 177 / 184.',
  },
  {
    title: 'Unconditional Right-of-Way to Emergency Vehicles',
    category: 'Night & Emergency',
    icon: '🚑',
    ruleDesc: 'Every driver must immediately steer to the left edge of the road and stop to provide an unobstructed clear corridor for Ambulances, Fire Trucks, and Police.',
    bestPractice: 'Do not follow closely behind an ambulance (ambulance drafting is extremely dangerous and illegal).',
    legalNotice: 'Failure to clear way for emergency vehicles attracts ₹10,000 fine and up to 6 months imprisonment under Section 194E.',
  },
  {
    title: 'Yellow Box Junction Clearance',
    category: 'Pedestrian & Junction',
    icon: '🟨',
    ruleDesc: 'You must NOT enter a yellow criss-cross box junction unless your exit lane is completely clear and you can cross without stopping inside the box.',
    bestPractice: 'Wait behind the junction stop line until the road ahead on your intended route is completely free.',
    legalNotice: 'Stopping inside a yellow box junction causes gridlock and is captured by automatic traffic cameras.',
  },
];

const INSURANCE_BENEFITS_DATA: InsuranceBenefitItem[] = [
  {
    title: 'Zero Depreciation (0-Dep / Bumper-to-Bumper)',
    badge: 'Most Popular Addon',
    icon: '💎',
    shortDesc: 'Eliminates all depreciation deductions on plastic, rubber, fiber, and metal parts during accident repair claims.',
    details: [
      '100% full reimbursement on costly plastic bumpers, headlamp assemblies, fiberglass, and metal body panels.',
      'Without Zero-Dep, standard policies deduct up to 50% on plastic/rubber and up to 40% on metal parts.',
      'Recommended for all cars and two-wheelers aged 0 to 7 years.',
    ],
    savingsExample: 'On a ₹50,000 accident repair bill, Zero-Dep saves you ₹24,000 in out-of-pocket expenses!',
    actionLabel: 'Check 0-Dep Quotes',
    actionPath: '/car-insurance',
  },
  {
    title: '100% Cashless Claim Settlement',
    badge: '5,400+ Garages',
    icon: '💳',
    shortDesc: 'Drive into any authorized cashless network workshop, get vehicle repaired, and drive out without paying repair bills.',
    details: [
      'Direct cashless settlement between the insurance company and the authorized service workshop.',
      'Spot digital surveyor inspection via smartphone video call in under 30 minutes.',
      'You only pay the standard compulsory deductible (₹1,000 for LMV / ₹100 for Bikes).',
    ],
    savingsExample: 'Zero upfront repair expenses during unexpected roadside accidents.',
    actionLabel: 'Instant Claim Process',
    actionPath: '/claim-insurance',
  },
  {
    title: 'No Claim Bonus (NCB) Protection',
    badge: 'Save Up to 50%',
    icon: '🏆',
    shortDesc: 'Protects your accumulated 20% to 50% renewal discount even if you make an accident claim during the policy year.',
    details: [
      'NCB accumulates by 20%, 25%, 35%, 45%, up to a maximum 50% discount for every claim-free year.',
      'Without NCB protector, making even 1 minor claim resets your bonus back to 0%.',
      'NCB stays with the owner and can be transferred when purchasing a new car or bike.',
    ],
    savingsExample: 'Saves ₹8,000 to ₹18,000 on your annual renewal insurance premiums.',
    actionLabel: 'Renew with NCB Transfer',
    actionPath: '/renewal-insurance',
  },
  {
    title: '24x7 Emergency Roadside Assistance (RSA)',
    badge: 'All-India 24/7',
    icon: '🛟',
    shortDesc: 'Emergency on-spot breakdown support anywhere across highways and city roads with a single phone tap.',
    details: [
      'Free breakdown towing to the nearest authorized workshop up to 50 km.',
      'On-spot battery jumpstart for dead batteries and flat tyre replacement assistance.',
      'Emergency fuel delivery (up to 5 litres) and locked key retrieval assistance.',
    ],
    savingsExample: 'Saves emergency highway towing charges averaging ₹3,500 to ₹6,000 per breakdown.',
    actionLabel: 'View RSA Addons',
    actionPath: '/check-insurance',
  },
  {
    title: 'Compulsory Personal Accident (PA) Cover (₹15 Lakhs)',
    badge: 'Mandatory by Law',
    icon: '🛡️',
    shortDesc: 'Comprehensive financial protection of ₹15,00,000 capital sum insured for the vehicle owner-driver.',
    details: [
      'Covers accidental death, permanent total disability, and loss of limbs/eyesight.',
      'Mandatory by law under the Motor Vehicles Act for all registered vehicle owners in India.',
      'A single 1-year CPA policy covers all personal vehicles owned by the individual.',
    ],
    savingsExample: '₹15,00,000 financial safety cushion for your family at just ₹330/year premium.',
    actionLabel: 'Add CPA Cover',
    actionPath: '/bike-insurance',
  },
  {
    title: 'Engine & Gearbox Hydrostatic Lock Protection',
    badge: 'Monsoon Essential',
    icon: '⚙️',
    shortDesc: 'Protects against catastrophic engine and gearbox failure caused by waterlogging, flood ingress, or lubricating oil leakage.',
    details: [
      'Standard insurance policies explicitly exclude hydrostatic lock damages caused by driving through water.',
      'Covers complete engine replacement, piston repair, cylinder head machining, and gearbox rebuild.',
      'Absolute must-have for coastal and monsoon-prone cities.',
    ],
    savingsExample: 'A flooded luxury engine rebuild can cost ₹1.5L to ₹4.5L — covered 100% with this addon.',
    actionLabel: 'Get Engine Protect',
    actionPath: '/car-insurance',
  },
];

export const TrafficRulesModal: React.FC<TrafficRulesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'traffic_rules',
}) => {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<RulesTabType>(initialTab);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Sync initial tab when changed
  React.useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Filter logic for Traffic Rules
  const penaltyCategories = ['All', 'Safety', 'Driving Violation', 'Documentation', 'Pollution & Vehicle'];
  const filteredPenalties = PENALTIES_DATA.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    if (!matchCat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.offense.toLowerCase().includes(q) ||
      p.section.toLowerCase().includes(q) ||
      p.newFine.toLowerCase().includes(q)
    );
  });

  // Filter logic for Road Rules
  const roadRuleCategories = ['All', 'Lane & Overtaking', 'Speed Limits', 'Pedestrian & Junction', 'Night & Emergency'];
  const filteredRoadRules = ROAD_RULES_DATA.filter((r) => {
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    if (!matchCat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.ruleDesc.toLowerCase().includes(q) ||
      r.bestPractice.toLowerCase().includes(q)
    );
  });

  // Filter logic for Insurance Benefits
  const filteredInsuranceBenefits = INSURANCE_BENEFITS_DATA.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.shortDesc.toLowerCase().includes(q) ||
      b.details.some((d) => d.toLowerCase().includes(q))
    );
  });

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '890px',
          height: '90vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          border: '1.5px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            background:
              activeMainTab === 'insurance'
                ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0284c7 100%)'
                : activeMainTab === 'road_rules'
                ? 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)'
                : 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
            color: '#ffffff',
            padding: '18px 24px 14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
              }}
            >
              {activeMainTab === 'insurance' ? '🛡️' : activeMainTab === 'road_rules' ? '🛣️' : '🚦'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                  {activeMainTab === 'insurance'
                    ? 'Vehicle Insurance Benefits & Claim Guide'
                    : activeMainTab === 'road_rules'
                    ? 'Indian Road Safety & Driving Rules'
                    : 'Traffic Rules & Penalty Fines Directory'}
                </h3>
                <span
                  style={{
                    background: '#fef08a',
                    color: '#854d0e',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  2026 Guidelines
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {activeMainTab === 'insurance'
                  ? 'Complete guide to Cashless Claims, Zero-Dep, NCB, and roadside perks'
                  : activeMainTab === 'road_rules'
                  ? 'Lane discipline, right-of-way, night high-beam, and emergency protocols'
                  : 'Official Motor Vehicles Act fines, offenses, and license suspension rules'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.4rem' }} />
          </button>
        </div>

        {/* 3 Main Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: '#f1f5f9',
            borderBottom: '1.5px solid #e2e8f0',
            padding: '4px',
            gap: '4px',
          }}
        >
          {/* Tab 1: Insurance Benefits */}
          <button
            onClick={() => {
              setActiveMainTab('insurance');
              setSelectedCategory('All');
              setQuery('');
            }}
            style={{
              background: activeMainTab === 'insurance' ? '#ffffff' : 'transparent',
              color: activeMainTab === 'insurance' ? '#1e3a8a' : '#64748b',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeMainTab === 'insurance' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛡️</span>
            <span>Insurance Benefits</span>
          </button>

          {/* Tab 2: Road Rules */}
          <button
            onClick={() => {
              setActiveMainTab('road_rules');
              setSelectedCategory('All');
              setQuery('');
            }}
            style={{
              background: activeMainTab === 'road_rules' ? '#ffffff' : 'transparent',
              color: activeMainTab === 'road_rules' ? '#065f46' : '#64748b',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeMainTab === 'road_rules' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛣️</span>
            <span>Road Rules</span>
          </button>

          {/* Tab 3: Traffic Rules & Penalties */}
          <button
            onClick={() => {
              setActiveMainTab('traffic_rules');
              setSelectedCategory('All');
              setQuery('');
            }}
            style={{
              background: activeMainTab === 'traffic_rules' ? '#ffffff' : 'transparent',
              color: activeMainTab === 'traffic_rules' ? '#c2410c' : '#64748b',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeMainTab === 'traffic_rules' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🚦</span>
            <span>Traffic Rules & Fines</span>
          </button>
        </div>

        {/* Pinned Search & Filter Subbar */}
        <div style={{ background: '#ffffff', padding: '12px 24px', borderBottom: '1.5px solid #e2e8f0' }}>
          <div style={{ position: 'relative', marginBottom: activeMainTab === 'insurance' ? 0 : '8px' }}>
            <IonIcon
              icon={searchOutline}
              style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '1.2rem' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeMainTab === 'insurance'
                  ? 'Search insurance benefits (e.g. Zero-Dep, Cashless, NCB, Engine protect)...'
                  : activeMainTab === 'road_rules'
                  ? 'Search road rules (e.g. Overtaking, Speed limits, Zebra crossing, High beam)...'
                  : 'Search offense & fines (e.g. Helmet, Seatbelt, Drunk driving, Signal jump, License)...'
              }
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                background: '#f8fafc',
              }}
            />
          </div>

          {/* Category Chips for Road Rules */}
          {activeMainTab === 'road_rules' && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px' }}>
              {roadRuleCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: `1.5px solid ${selectedCategory === c ? '#059669' : '#e2e8f0'}`,
                    background: selectedCategory === c ? '#ecfdf5' : '#ffffff',
                    color: selectedCategory === c ? '#047857' : '#475569',
                    fontSize: '0.76rem',
                    fontWeight: selectedCategory === c ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Category Chips for Traffic Rules */}
          {activeMainTab === 'traffic_rules' && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px' }}>
              {penaltyCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: `1.5px solid ${selectedCategory === c ? '#ea580c' : '#e2e8f0'}`,
                    background: selectedCategory === c ? '#fff7ed' : '#ffffff',
                    color: selectedCategory === c ? '#c2410c' : '#475569',
                    fontSize: '0.76rem',
                    fontWeight: selectedCategory === c ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= MODAL BODY CONTENT ================= */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {/* TAB 1: INSURANCE BENEFITS */}
          {activeMainTab === 'insurance' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {filteredInsuranceBenefits.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                          {item.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#1d4ed8',
                            fontWeight: 800,
                            background: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            display: 'inline-block',
                            marginTop: '2px',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {item.actionLabel && (
                      <button
                        onClick={() => {
                          onClose();
                          if (item.actionPath) navigate(item.actionPath);
                        }}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '7px 16px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                        }}
                      >
                        {item.actionLabel} →
                      </button>
                    )}
                  </div>

                  <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                    {item.shortDesc}
                  </p>

                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '10px 14px', marginBottom: '10px' }}>
                    {item.details.map((d, dIdx) => (
                      <div key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                        <span style={{ color: '#16a34a', fontWeight: 900 }}>✓</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#047857', fontWeight: 700, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span>💰</span>
                    <span>{item.savingsExample}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ROAD RULES */}
          {activeMainTab === 'road_rules' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {filteredRoadRules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{rule.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                        {rule.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#065f46',
                          fontWeight: 700,
                          background: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          marginTop: '2px',
                        }}
                      >
                        {rule.category}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 8px 0', fontSize: '0.86rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.4 }}>
                    {rule.ruleDesc}
                  </p>

                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '10px 14px', marginBottom: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    <strong style={{ color: '#0f172a' }}>Driving Best Practice: </strong>
                    {rule.bestPractice}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#991b1b', background: '#fef2f2', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    ⚠️ {rule.legalNotice}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TRAFFIC RULES & PENALTIES */}
          {activeMainTab === 'traffic_rules' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {filteredPenalties.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: '1.5px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {item.section}
                      </span>
                      <span
                        style={{
                          background: '#fff1f2',
                          color: '#be123c',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.offense}
                    </h4>

                    {item.repeatOffense && (
                      <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
                        ⚠️ Repeat Offense: {item.repeatOffense}
                      </div>
                    )}

                    {item.suspension && (
                      <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                        🚫 {item.suspension}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Penalty Fine</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>
                      {item.newFine}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      Earlier: {item.oldFine}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <span>Official MoRTH, Motor Vehicles Act 2019/2026 & IRDAI Guidelines</span>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '7px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
