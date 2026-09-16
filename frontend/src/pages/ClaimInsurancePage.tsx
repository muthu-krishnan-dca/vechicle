import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  downloadOutline,
  documentTextOutline,
  carSportOutline,
  buildOutline,
  personCircleOutline,
  businessOutline,
  timeOutline,
  addCircleOutline,
  trashOutline,
  sparklesOutline,
  checkmarkDoneOutline,
  refreshOutline,
  walletOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  api,
  VehicleRecord,
  PolicyRecord,
  ClaimAssessment,
  ClaimRecord,
  ProcessedPartItem,
} from '../services/api';
import { generateClaimAssessmentPDF } from '../services/claimPdfGenerator';

interface PartInput {
  id: string;
  name: string;
  category: 'PLASTIC' | 'RUBBER' | 'GLASS' | 'FIBRE' | 'METAL';
  amount: number;
}

interface ClaimAccidentScenario {
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
  suggestedParts: { name: string; category: 'PLASTIC' | 'RUBBER' | 'GLASS' | 'FIBRE' | 'METAL'; amount: number }[];
}

const CLAIM_ACCIDENT_SCENARIOS: ClaimAccidentScenario[] = [
  {
    id: 'minor',
    name: 'Minor Fender Scrape & Scratch',
    badge: '🟢 Minor Impact',
    description: 'Front mudguard scrape, broken rear-view mirror, minor bumper dent.',
    totalRepair: 7500,
    plasticAmount: 3200,
    rubberAmount: 800,
    glassAmount: 500,
    metalAmount: 1500,
    fibreAmount: 0,
    labourAmount: 1500,
    suggestedParts: [
      { name: 'Front Mudguard & Cowl (Plastic)', category: 'PLASTIC', amount: 3200 },
      { name: 'Rear View Mirror (Glass)', category: 'GLASS', amount: 500 },
      { name: 'Front Lever & Grip (Metal)', category: 'METAL', amount: 1500 },
      { name: 'Fork Bush & Rubber O-Rings', category: 'RUBBER', amount: 800 },
    ],
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
    suggestedParts: [
      { name: 'Front Headlamp & Visor (Glass)', category: 'GLASS', amount: 3500 },
      { name: 'Front Cowl & Mudguard Assembly (Plastic)', category: 'PLASTIC', amount: 10000 },
      { name: 'Handlebar & Shock Absorber Rods (Metal)', category: 'METAL', amount: 5500 },
      { name: 'Front Tyres & Hydraulic Hoses (Rubber)', category: 'RUBBER', amount: 3000 },
      { name: 'Side Fairing Cowling (Fibre Glass)', category: 'FIBRE', amount: 1000 },
    ],
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
    suggestedParts: [
      { name: 'Full Instrument Cluster & Headlamp (Glass)', category: 'GLASS', amount: 4000 },
      { name: 'Complete Body Shell & Panels (Plastic)', category: 'PLASTIC', amount: 22000 },
      { name: 'Fuel Tank, Alloy Rim & Chassis Frame (Metal)', category: 'METAL', amount: 20000 },
      { name: 'Dual Tyres, Tubes & Dampers (Rubber)', category: 'RUBBER', amount: 6000 },
      { name: 'Side Engine Fairings (Fibre)', category: 'FIBRE', amount: 4000 },
    ],
  },
  {
    id: 'severe',
    name: 'Severe Overturn & Structural Loss',
    badge: '🔴 Severe Structural',
    description: 'Chassis distortion, windshield, engine casing guard, full panel replacement, suspension.',
    totalRepair: 135000,
    plasticAmount: 45000,
    rubberAmount: 15000,
    glassAmount: 12000,
    metalAmount: 42000,
    fibreAmount: 6000,
    labourAmount: 15000,
    suggestedParts: [
      { name: 'Windshield, Mirrors & Headlamp Units (Glass)', category: 'GLASS', amount: 12000 },
      { name: 'Complete Exterior Body Panels (Plastic)', category: 'PLASTIC', amount: 45000 },
      { name: 'Engine Crankcase, Front Axle & Subframe (Metal)', category: 'METAL', amount: 42000 },
      { name: 'Suspension Bushes, Mounts & Tubeless Tyres (Rubber)', category: 'RUBBER', amount: 15000 },
      { name: 'Underbody Aerodynamic Guard (Fibre)', category: 'FIBRE', amount: 6000 },
    ],
  },
];

export const ClaimInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'estimator' | 'insured' | 'workshop' | 'surveyor'>('estimator');

  // Accident Claim Estimator Interactive State
  const [estScenarioId, setEstScenarioId] = useState<string>('moderate');
  const [estVehicleType, setEstVehicleType] = useState<'2W' | '4W'>('2W');
  const [estVehicleAge, setEstVehicleAge] = useState<number>(2);
  const [estCustomBill, setEstCustomBill] = useState<number>(26000);
  const [estIsCustom, setEstIsCustom] = useState<boolean>(false);
  const [showEstimateBanner, setShowEstimateBanner] = useState<boolean>(false);

  // Input states
  const [plateInput, setPlateInput] = useState('TN69BS3112');
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [policy, setPolicy] = useState<PolicyRecord | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  // Accident details
  const todayStr = new Date().toISOString().split('T')[0];
  const [accidentDate, setAccidentDate] = useState(todayStr);
  const [accidentPlace, setAccidentPlace] = useState('Tuticorin Highway Junction, Tamil Nadu');
  const [accidentDesc, setAccidentDesc] = useState('Two-wheeler skid due to rain, front mudguard, cowl and headlamp damaged.');
  const [driverName, setDriverName] = useState('S. Kumar');
  const [driverDlNo, setDriverDlNo] = useState('TN-69-20200004521');
  const [firFiled, setFirFiled] = useState(false);
  const [firNumber, setFirNumber] = useState('');
  const [claimType, setClaimType] = useState<'CASHLESS' | 'REIMBURSEMENT'>('CASHLESS');
  const [workshopName, setWorkshopName] = useState('Royal Enfield & Multi-brand Authorized Service Center');

  // Document checkboxes
  const [isRcSubmitted, setIsRcSubmitted] = useState(true);
  const [isDlSubmitted, setIsDlSubmitted] = useState(true);
  const [isPolicySubmitted, setIsPolicySubmitted] = useState(true);
  const [isEstimateSubmitted, setIsEstimateSubmitted] = useState(true);

  // Damaged Parts List
  const [parts, setParts] = useState<PartInput[]>([
    { id: '1', name: 'Front Headlamp & Visor (Glass)', category: 'GLASS', amount: 2500 },
    { id: '2', name: 'Front Mudguard & Cowl (Plastic)', category: 'PLASTIC', amount: 3500 },
    { id: '3', name: 'Fuel Tank & Handlebar (Metal)', category: 'METAL', amount: 7500 },
    { id: '4', name: 'Side Fairing Panels (Fibre Glass)', category: 'FIBRE', amount: 3000 },
  ]);
  const [labourAmount, setLabourAmount] = useState(2500);

  // Custom Part Form
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<'PLASTIC' | 'RUBBER' | 'GLASS' | 'FIBRE' | 'METAL'>('PLASTIC');
  const [newPartAmount, setNewPartAmount] = useState<number | ''>('');

  // Assessment and submission state
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<ClaimRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Surveyor tab claims list
  const [claimsList, setClaimsList] = useState<ClaimRecord[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [selectedSurveyorClaim, setSelectedSurveyorClaim] = useState<ClaimRecord | null>(null);
  const [surveyorNotesInput, setSurveyorNotesInput] = useState('');

  // Auto-fetch vehicle on mount
  useEffect(() => {
    handleFetchVehicle('TN69BS3112');
    loadAllClaims();
  }, []);

  const handleFetchVehicle = async (regToSearch?: string) => {
    const reg = (regToSearch || plateInput).replace(/\s+/g, '').toUpperCase().trim();
    if (!reg) return;
    setPlateInput(reg);
    setLoadingVehicle(true);
    setErrorMessage('');
    setSubmittedClaim(null);

    try {
      const v = await api.getVehicleRC(reg);
      setVehicle(v);
      setDriverName(v.owner_name || 'Registered Owner');

      // Fetch active policies from vault if any
      const policies = await api.getVaultPolicies(reg);
      if (policies && policies.length > 0) {
        setPolicy(policies[0]);
      } else {
        setPolicy(null);
      }

      // Automatically run calculation
      runLiveCalculation(reg, v);
    } catch (err: any) {
      console.error('Fetch vehicle error:', err);
      setErrorMessage(`Vehicle ${reg} records not found.`);
      setVehicle(null);
    } finally {
      setLoadingVehicle(false);
    }
  };

  const runLiveCalculation = async (regNo?: string, vObj?: VehicleRecord | null) => {
    const targetReg = regNo || plateInput;
    if (!targetReg) return;
    setEvaluating(true);
    setErrorMessage('');

    try {
      const payload = {
        vehicle_reg_no: targetReg,
        accident_date: accidentDate,
        accident_place: accidentPlace,
        accident_description: accidentDesc,
        driver_name: driverName,
        driver_license_no: driverDlNo,
        claim_type: claimType,
        workshop_name: workshopName,
        is_rc_submitted: isRcSubmitted,
        is_dl_submitted: isDlSubmitted,
        is_policy_submitted: isPolicySubmitted,
        is_estimate_submitted: isEstimateSubmitted,
        claimed_parts: parts.map((p) => ({
          name: p.name,
          category: p.category,
          amount: p.amount,
        })),
        claimed_labour_amount: Number(labourAmount || 0),
      };

      const res = await api.calculateClaim(payload);
      setAssessment(res);
    } catch (err: any) {
      console.error('Calculate claim error:', err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to calculate claim assessment.';
      setErrorMessage(msg);
    } finally {
      setEvaluating(false);
    }
  };

  // Trigger calculation when parts or accident date changes
  useEffect(() => {
    if (vehicle) {
      runLiveCalculation(vehicle.registration_number, vehicle);
    }
  }, [accidentDate, parts, labourAmount, claimType, isRcSubmitted, isDlSubmitted, isPolicySubmitted, isEstimateSubmitted]);

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartAmount || Number(newPartAmount) <= 0) return;
    const newP: PartInput = {
      id: Date.now().toString(),
      name: newPartName,
      category: newPartCategory,
      amount: Number(newPartAmount),
    };
    setParts([...parts, newP]);
    setNewPartName('');
    setNewPartAmount('');
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleSubmitClaim = async () => {
    if (!vehicle) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        vehicle_reg_no: vehicle.registration_number,
        accident_date: accidentDate,
        accident_place: accidentPlace,
        accident_description: accidentDesc,
        driver_name: driverName,
        driver_license_no: driverDlNo,
        fir_filed: firFiled,
        fir_number: firNumber,
        claim_type: claimType,
        workshop_name: workshopName,
        is_rc_submitted: isRcSubmitted,
        is_dl_submitted: isDlSubmitted,
        is_policy_submitted: isPolicySubmitted,
        is_estimate_submitted: isEstimateSubmitted,
        claimed_parts: parts.map((p) => ({
          name: p.name,
          category: p.category,
          amount: p.amount,
        })),
        claimed_labour_amount: Number(labourAmount || 0),
      };

      const res = await api.submitClaim(payload);
      setSubmittedClaim(res);
      setAssessment(res.assessment);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Refresh claims list for surveyor tab
      loadAllClaims();
    } catch (err: any) {
      console.error('Submit claim error:', err);
      const msg = err?.response?.data?.error || 'Failed to submit claim. Please verify all details.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const loadAllClaims = async () => {
    setLoadingClaims(true);
    try {
      const list = await api.getClaims();
      setClaimsList(list);
    } catch (err) {
      console.error('Failed to load claims list:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleSurveyorUpdateStatus = async (
    claimNo: string,
    newStatus: 'APPROVED' | 'REJECTED' | 'SETTLED'
  ) => {
    try {
      const updated = await api.updateClaimStatus(claimNo, {
        status: newStatus,
        surveyor_notes: surveyorNotesInput || `Surveyor updated claim status to ${newStatus} after physical verification.`,
      });
      loadAllClaims();
      setSelectedSurveyorClaim(updated);
      alert(`Claim ${claimNo} marked as ${newStatus} successfully!`);
    } catch (err) {
      console.error('Surveyor update error:', err);
      alert('Failed to update claim status.');
    }
  };

  const handleDownloadPDF = () => {
    if (!assessment) return;
    generateClaimAssessmentPDF(assessment, submittedClaim || undefined);
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
            padding: '38px 20px 52px',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '2px solid #facc15',
            boxShadow: '0 10px 30px rgba(234, 179, 8, 0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Header badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span
                style={{
                  background: 'rgba(254, 240, 138, 0.85)',
                  border: '1.5px solid #eab308',
                  color: '#854d0e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} />
                IRDAI Standard Claim Engine
              </span>
              <span
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #facc15',
                  color: '#b45309',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 8px rgba(234, 179, 8, 0.1)',
                }}
              >
                <IonIcon icon={sparklesOutline} />
                Cashless & Reimbursement
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: '0 0 10px 0',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Vehicle Insurance Claim System
            </h1>
            <p
              style={{
                color: '#475569',
                fontSize: '1.05rem',
                maxWidth: '750px',
                margin: '0 0 24px 0',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              Comprehensive vehicle insurance claim estimator & instant approval portal. Real-time policy continuity verification,
              IRDAI depreciation deductions (Glass, Plastic, Fibre, Metal), compulsory excess, and cashless settlement calculations.
            </p>

            {/* Quick Metrics Bar in White and Yellow card style */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  border: '1.5px solid #fef08a',
                  boxShadow: '0 4px 15px rgba(234, 179, 8, 0.08)',
                }}
              >
                <div style={{ color: '#854d0e', fontSize: '0.75rem', fontWeight: 700 }}>COMPULSORY EXCESS</div>
                <div style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 900 }}>₹100 (2W) / ₹1,000 (4W)</div>
                <div style={{ color: '#b45309', fontSize: '0.72rem', fontWeight: 600 }}>Standard IRDAI Tariff</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  border: '1.5px solid #fef08a',
                  boxShadow: '0 4px 15px rgba(234, 179, 8, 0.08)',
                }}
              >
                <div style={{ color: '#854d0e', fontSize: '0.75rem', fontWeight: 700 }}>DEPRECIATION DEDUCTION</div>
                <div style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 900 }}>Glass 0% | Plastic 50%</div>
                <div style={{ color: '#16a34a', fontSize: '0.72rem', fontWeight: 700 }}>Zero-Dep: 0% Deductions</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  border: '1.5px solid #fef08a',
                  boxShadow: '0 4px 15px rgba(234, 179, 8, 0.08)',
                }}
              >
                <div style={{ color: '#854d0e', fontSize: '0.75rem', fontWeight: 700 }}>NETWORK WORKSHOPS</div>
                <div style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 900 }}>4,800+ Cashless</div>
                <div style={{ color: '#ca8a04', fontSize: '0.72rem', fontWeight: 700 }}>Direct Insurer Settlement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Claim Offers Banner ("athula offer") */}
        <div style={{ maxWidth: '1200px', margin: '-16px auto 20px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              background: 'linear-gradient(90deg, #ffffff 0%, #fffdf0 50%, #fef9c3 100%)',
              border: '1.5px solid #fde047',
              borderRadius: '16px',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 6px 20px rgba(202, 138, 4, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🎁</span>
              <div>
                <span style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SPECIAL ACCIDENT CLAIM OFFERS & CASHLESS PERKS
                </span>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                  Free Emergency Towing up to 50 KM + 30-Min Self-Survey Approval
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '5px 12px', borderRadius: '20px' }}>
                <span>✓</span>
                <span>₹0 Cashless Advance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 700, background: '#eff6ff', padding: '5px 12px', borderRadius: '20px' }}>
                <span>✓</span>
                <span>4,800+ Garages</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#854d0e', fontWeight: 700, background: '#fef3c7', padding: '5px 12px', borderRadius: '20px' }}>
                <span>✓</span>
                <span>6-Month Repair Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Stakeholder Tabs Navigation */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 24px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {/* TAB 0: ACCIDENT CLAIM ESTIMATOR */}
            <button
              onClick={() => setActiveTab('estimator')}
              style={{
                flex: '1 1 200px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'estimator' ? '#2563eb' : 'transparent',
                color: activeTab === 'estimator' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>💥</span>
              <span>Accident Claim Estimator</span>
              <span
                style={{
                  background: activeTab === 'estimator' ? 'rgba(255,255,255,0.25)' : '#fef08a',
                  color: activeTab === 'estimator' ? '#ffffff' : '#854d0e',
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontWeight: 800,
                }}
              >
                QUICK
              </span>
            </button>

            <button
              onClick={() => setActiveTab('insured')}
              style={{
                flex: '1 1 180px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'insured' ? '#2563eb' : 'transparent',
                color: activeTab === 'insured' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={personCircleOutline} style={{ fontSize: '1.2rem' }} />
              <span>1. Insured Form</span>
            </button>

            <button
              onClick={() => setActiveTab('workshop')}
              style={{
                flex: '1 1 180px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'workshop' ? '#2563eb' : 'transparent',
                color: activeTab === 'workshop' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={buildOutline} style={{ fontSize: '1.2rem' }} />
              <span>2. Workshop Estimate</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('surveyor');
                loadAllClaims();
              }}
              style={{
                flex: '1 1 180px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'surveyor' ? '#2563eb' : 'transparent',
                color: activeTab === 'surveyor' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={businessOutline} style={{ fontSize: '1.2rem' }} />
              <span>3. Surveyor Desk</span>
              {claimsList.length > 0 && (
                <span
                  style={{
                    background: activeTab === 'surveyor' ? '#ffffff' : '#ef4444',
                    color: activeTab === 'surveyor' ? '#2563eb' : '#ffffff',
                    borderRadius: '10px',
                    padding: '2px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {claimsList.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
          {/* TAB 0: INTERACTIVE ACCIDENT CLAIM PAYOUT ESTIMATOR */}
          {activeTab === 'estimator' && (() => {
            const activeSc = CLAIM_ACCIDENT_SCENARIOS.find((s) => s.id === estScenarioId) || CLAIM_ACCIDENT_SCENARIOS[1];
            const totalEstBill = estIsCustom ? estCustomBill : activeSc.totalRepair;
            const ratio = estIsCustom && activeSc.totalRepair > 0 ? estCustomBill / activeSc.totalRepair : 1;

            const plasticVal = Math.round(activeSc.plasticAmount * ratio);
            const rubberVal = Math.round(activeSc.rubberAmount * ratio);
            const glassVal = Math.round(activeSc.glassAmount * ratio);
            const fibreVal = Math.round(activeSc.fibreAmount * ratio);
            const metalVal = Math.round(activeSc.metalAmount * ratio);

            // Metal depreciation by age
            const getMetalPct = (age: number) => {
              if (age <= 0.5) return 0;
              if (age <= 1) return 5;
              if (age <= 2) return 10;
              if (age <= 3) return 15;
              if (age <= 4) return 25;
              if (age <= 5) return 35;
              return 40;
            };
            const metalPct = getMetalPct(estVehicleAge);
            const excessVal = estVehicleType === '2W' ? 100 : 1000;

            // Standard Comprehensive Calculation
            const plasticDep = Math.round(plasticVal * 0.5);
            const rubberDep = Math.round(rubberVal * 0.5);
            const fibreDep = Math.round(fibreVal * 0.3);
            const metalDep = Math.round((metalVal * metalPct) / 100);
            const totalDepStandard = plasticDep + rubberDep + fibreDep + metalDep;

            const approvedStandard = Math.max(0, totalEstBill - totalDepStandard - excessVal);
            const customerShareStandard = Math.max(0, totalEstBill - approvedStandard);

            // Zero-Dep Calculation
            const approvedZeroDep = Math.max(0, totalEstBill - excessVal);
            const customerShareZeroDep = excessVal;
            const zeroDepSavings = approvedZeroDep - approvedStandard;

            const handleApplyEstimateToClaim = () => {
              // Convert scenario parts to PartInput format
              const newParts: PartInput[] = activeSc.suggestedParts.map((p, idx) => ({
                id: String(Date.now() + idx),
                name: p.name,
                category: p.category,
                amount: Math.round(p.amount * ratio),
              }));
              setParts(newParts);
              setLabourAmount(Math.round(activeSc.labourAmount * ratio));
              setShowEstimateBanner(true);
              setActiveTab('insured');
              if (vehicle) {
                runLiveCalculation(plateInput, vehicle);
              }
              try {
                confetti({
                  particleCount: 75,
                  spread: 60,
                  origin: { y: 0.5 },
                  colors: ['#2563eb', '#10b981', '#f59e0b'],
                });
              } catch (e) {}
            };

            return (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '30px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      <span>💥</span>
                      <span>ACCIDENT CLAIM PAYOUT ESTIMATOR</span>
                    </div>
                    <h2 style={{ margin: '4px 0 6px', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      Accident Aguna Insurance Claim Evolo Agum?
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '780px' }}>
                      Select an accident damage scenario or enter an estimated repair cost below. Compare approved payout under <strong>Standard Comprehensive</strong> vs <strong>Zero-Depreciation</strong> cover.
                    </p>
                  </div>

                  {/* Vehicle Type Toggle */}
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', border: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => setEstVehicleType('2W')}
                      style={{
                        background: estVehicleType === '2W' ? '#2563eb' : 'transparent',
                        color: estVehicleType === '2W' ? '#ffffff' : '#475569',
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
                      <span>Bike (Excess ₹100)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstVehicleType('4W')}
                      style={{
                        background: estVehicleType === '4W' ? '#2563eb' : 'transparent',
                        color: estVehicleType === '4W' ? '#ffffff' : '#475569',
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
                      <span>Car (Excess ₹1,000)</span>
                    </button>
                  </div>
                </div>

                {/* Scenario Picker Grid */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '10px' }}>
                    Choose Accident Severity Preset:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {CLAIM_ACCIDENT_SCENARIOS.map((sc) => {
                      const isSelected = !estIsCustom && estScenarioId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setEstIsCustom(false);
                            setEstScenarioId(sc.id);
                            setEstCustomBill(sc.totalRepair);
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

                {/* Slider for Repair Bill & Vehicle Age */}
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
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                        Accident Repair Bill Cost:
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>
                        ₹{totalEstBill.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="150000"
                      step="1000"
                      value={totalEstBill}
                      onChange={(e) => {
                        setEstIsCustom(true);
                        setEstCustomBill(Number(e.target.value));
                      }}
                      style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>₹3,000 (Scratch)</span>
                      <span>₹75,000 (Major)</span>
                      <span>₹1,50,000 (Crash)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block' }}>
                        Vehicle Age:
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Metal Dep: {metalPct}%
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
                          onClick={() => setEstVehicleAge(item.age)}
                          style={{
                            background: estVehicleAge === item.age ? '#0f172a' : '#ffffff',
                            color: estVehicleAge === item.age ? '#ffffff' : '#334155',
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

                {/* Side-by-side Payout Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {/* Standard Policy Card */}
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
                        STANDARD POLICY
                      </span>
                      <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.8rem' }}>
                        IRDAI Depreciation Deducted
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      With Standard Cover
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.86rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Total Repair Bill:</span>
                        <strong style={{ color: '#0f172a' }}>₹{totalEstBill.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>Plastic & Rubber Dep (50% cut):</span>
                        <strong>-₹{(plasticDep + rubberDep).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>Fibre ({30}%) & Metal ({metalPct}%) cut:</span>
                        <strong>-₹{(fibreDep + metalDep).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Compulsory Deductible:</span>
                        <strong style={{ color: '#dc2626' }}>-₹{excessVal.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.88rem' }}>Insurer Payout:</span>
                        <span style={{ color: '#b91c1c', fontWeight: 900, fontSize: '1.3rem' }}>
                          ₹{approvedStandard.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #fca5a5', paddingTop: '8px' }}>
                        <span style={{ color: '#7f1d1d', fontWeight: 800, fontSize: '0.88rem' }}>YOU PAY FROM POCKET:</span>
                        <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.25rem' }}>
                          ₹{customerShareStandard.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Zero-Depreciation Policy Card */}
                  <div
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                      borderRadius: '18px',
                      border: '2px solid #10b981',
                      padding: '24px',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                        ZERO DEPRECIATION (BUMPER TO BUMPER)
                      </span>
                      <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem' }}>
                        100% Parts Paid!
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
                      With Zero-Dep Cover
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.86rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Total Repair Bill:</span>
                        <strong style={{ color: '#0f172a' }}>₹{totalEstBill.toLocaleString('en-IN')}</strong>
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
                        <span>Compulsory Deductible:</span>
                        <strong style={{ color: '#dc2626' }}>-₹{excessVal.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#065f46', fontWeight: 700, fontSize: '0.88rem' }}>Insurer Payout:</span>
                        <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.3rem' }}>
                          ₹{approvedZeroDep.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #a7f3d0', paddingTop: '8px' }}>
                        <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.88rem' }}>YOU PAY FROM POCKET:</span>
                        <span style={{ color: '#065f46', fontWeight: 900, fontSize: '1.25rem' }}>
                          ₹{customerShareZeroDep.toLocaleString('en-IN')} (Only Excess)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Card */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      Ready to file your claim for {vehicle?.registration_number || plateInput}?
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>
                      You save ₹{zeroDepSavings.toLocaleString('en-IN')} with Zero-Dep. You can load this exact estimate into the Insured claim form with one click.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleApplyEstimateToClaim}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 22px',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      <span>Apply & File Claim Form</span>
                      <IonIcon icon={arrowForwardOutline} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/renewal-insurance')}
                      style={{
                        background: '#fef08a',
                        color: '#854d0e',
                        border: '1px solid #facc15',
                        borderRadius: '12px',
                        padding: '12px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Renew with Zero-Dep (85% OFF)
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 1: INSURED / POLICYHOLDER CLAIM FILING & CALCULATION */}
          {activeTab === 'insured' && (
            <div>
              {showEstimateBanner && (
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
                    color: '#15803d',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.4rem', color: '#16a34a' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Estimate applied! Damaged parts and repair labour have been loaded into your claim form.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEstimateBanner(false)}
                    style={{ background: 'transparent', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Form & Parts Entry */}
              <div>
                {/* 1. Vehicle & Policy Lookup Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🚗</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        Step 1: Vehicle & Active Policy Check
                      </h3>
                    </div>
                    {/* Quick Example Chips */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleFetchVehicle('TN69BS3112')}
                        style={{
                          background: plateInput === 'TN69BS3112' ? '#eff6ff' : '#f1f5f9',
                          border: plateInput === 'TN69BS3112' ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#1e3a8a',
                        }}
                      >
                        TN69BS3112
                      </button>
                      <button
                        onClick={() => handleFetchVehicle('TN92L1078')}
                        style={{
                          background: plateInput === 'TN92L1078' ? '#eff6ff' : '#f1f5f9',
                          border: plateInput === 'TN92L1078' ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#1e3a8a',
                        }}
                      >
                        TN92L1078
                      </button>
                    </div>
                  </div>

                  {/* Input form */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        border: '2px solid #0f172a',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          background: '#1e3a8a',
                          color: '#ffffff',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>IND</span>
                        <span style={{ fontSize: '0.55rem' }}>🇮🇳</span>
                      </div>
                      <input
                        type="text"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                        placeholder="e.g. TN69BS3112"
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          color: '#0f172a',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleFetchVehicle()}
                      disabled={loadingVehicle}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0 20px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {loadingVehicle ? <IonSpinner name="crescent" style={{ width: '18px', height: '18px' }} /> : <IonIcon icon={refreshOutline} />}
                      Fetch Data
                    </button>
                  </div>

                  {/* Loaded Vehicle Specs Pill */}
                  {vehicle && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          {vehicle.maker_model}
                        </span>
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          RC {vehicle.status}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>Owner: <strong style={{ color: '#1e293b' }}>{vehicle.owner_name}</strong></span>
                        <span>RTO: <strong style={{ color: '#1e293b' }}>{vehicle.rto_office}</strong></span>
                        <span>Engine: <strong style={{ color: '#1e293b' }}>{vehicle.engine_capacity_cc} CC</strong></span>
                      </div>
                      {/* Active Policy Status */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#475569' }}>
                          Insurance Coverage Upto: <strong>{vehicle.insurance_upto}</strong>
                        </span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>
                          {policy ? policy.insurer_name : 'Parivahan Verified Coverage'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Accident Details & Policy Continuity Check Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Step 2: Accident Date & Policy Continuity Check
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Accident Date *
                      </label>
                      <input
                        type="date"
                        value={accidentDate}
                        onChange={(e) => setAccidentDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Settlement Method
                      </label>
                      <select
                        value={claimType}
                        onChange={(e) => setClaimType(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          background: '#ffffff',
                          outline: 'none',
                          fontWeight: 600,
                        }}
                      >
                        <option value="CASHLESS">💳 Cashless Claim (Direct to Dealer)</option>
                        <option value="REIMBURSEMENT">🏦 Reimbursement Claim (Self-Pay)</option>
                      </select>
                    </div>
                  </div>

                  {/* Continuity Validation Indicator Alert */}
                  {assessment && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: assessment.continuity_status === 'VALID' ? '#f0fdf4' : '#fef2f2',
                        border: assessment.continuity_status === 'VALID' ? '1px solid #86efac' : '1px solid #fca5a5',
                        color: assessment.continuity_status === 'VALID' ? '#166534' : '#991b1b',
                      }}
                    >
                      <IonIcon
                        icon={assessment.continuity_status === 'VALID' ? checkmarkCircleOutline : closeCircleOutline}
                        style={{ fontSize: '1.3rem', flexShrink: 0 }}
                      />
                      <div>
                        <strong>
                          {assessment.continuity_status === 'VALID'
                            ? 'Policy Continuity Verified: Active Coverage Date Valid'
                            : 'Policy Continuity Failure: Incident outside Coverage Range'}
                        </strong>
                        <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                          {assessment.continuity_status === 'VALID'
                            ? `Accident on ${accidentDate} is within policy period. Claim is eligible for evaluation.`
                            : assessment.rejection_reasons[0]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Place and Driver Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Accident Location
                      </label>
                      <input
                        type="text"
                        value={accidentPlace}
                        onChange={(e) => setAccidentPlace(e.target.value)}
                        placeholder="e.g. Madurai Ring Road"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Driver License Number (DL No)
                      </label>
                      <input
                        type="text"
                        value={driverDlNo}
                        onChange={(e) => setDriverDlNo(e.target.value)}
                        placeholder="e.g. TN-69-20200004521"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Accident Description
                    </label>
                    <textarea
                      value={accidentDesc}
                      onChange={(e) => setAccidentDesc(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        resize: 'none',
                      }}
                    />
                  </div>

                  {/* Documentation checklist */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Mandatory Document Submissions:
                    </label>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isRcSubmitted} onChange={(e) => setIsRcSubmitted(e.target.checked)} />
                        <span>RC Book Copy</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isDlSubmitted} onChange={(e) => setIsDlSubmitted(e.target.checked)} />
                        <span>Driving License (DL)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isPolicySubmitted} onChange={(e) => setIsPolicySubmitted(e.target.checked)} />
                        <span>Policy Document</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isEstimateSubmitted} onChange={(e) => setIsEstimateSubmitted(e.target.checked)} />
                        <span>Workshop Estimate</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Damaged Parts Estimator & IRDAI Material Depreciation */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🔧</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        Step 3: Damaged Parts & IRDAI Depreciation
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {parts.length} Parts Claimed
                    </span>
                  </div>

                  {/* Add Part Form */}
                  <form onSubmit={handleAddPart} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Damaged part name (e.g. Side Mirror)"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      style={{
                        flex: 2,
                        minWidth: '180px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                    <select
                      value={newPartCategory}
                      onChange={(e) => setNewPartCategory(e.target.value as any)}
                      style={{
                        flex: 1.2,
                        minWidth: '130px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="PLASTIC">Plastic (50% Dep)</option>
                      <option value="RUBBER">Rubber/Nylon (50% Dep)</option>
                      <option value="GLASS">Glass (0% Dep)</option>
                      <option value="FIBRE">Fibre Glass (30% Dep)</option>
                      <option value="METAL">Metal (Age Scale)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={newPartAmount}
                      onChange={(e) => setNewPartAmount(e.target.value ? Number(e.target.value) : '')}
                      style={{
                        width: '100px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 14px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <IonIcon icon={addCircleOutline} />
                      Add
                    </button>
                  </form>

                  {/* Parts List Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Part Name</th>
                          <th style={{ padding: '8px 10px' }}>Category</th>
                          <th style={{ padding: '8px 10px' }}>Claimed</th>
                          <th style={{ padding: '8px 10px' }}>Dep. %</th>
                          <th style={{ padding: '8px 10px' }}>Approved</th>
                          <th style={{ padding: '8px 8px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts.map((p) => {
                          const assessedPart = assessment?.processed_parts.find((ap) => ap.name === p.name);
                          return (
                            <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span
                                  style={{
                                    background: '#e2e8f0',
                                    color: '#334155',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {p.category}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 600 }}>
                                {assessedPart ? `${assessedPart.depreciation_percent}%` : '-'}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 700 }}>
                                {assessedPart ? `₹${assessedPart.approved_amount.toLocaleString('en-IN')}` : `₹${p.amount}`}
                              </td>
                              <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleRemovePart(p.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Labour Charges Input */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>Labour & Tinkering / Painting Charges:</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>No depreciation applicable on labour charges</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>₹</span>
                      <input
                        type="number"
                        value={labourAmount}
                        onChange={(e) => setLabourAmount(Number(e.target.value) || 0)}
                        style={{
                          width: '100px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Claim Calculation & Settlement Outcome */}
              <div>
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'sticky',
                    top: '90px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      Claim Assessment Output
                    </h3>
                    {evaluating && <IonSpinner name="dots" style={{ color: '#2563eb' }} />}
                  </div>

                  {/* Status Banner */}
                  {assessment && (
                    <div
                      style={{
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background:
                          assessment.approval_status === 'APPROVED'
                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                            : assessment.approval_status === 'DOCUMENTS_PENDING'
                            ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: '#ffffff',
                      }}
                    >
                      <IonIcon
                        icon={
                          assessment.approval_status === 'APPROVED'
                            ? checkmarkCircleOutline
                            : assessment.approval_status === 'DOCUMENTS_PENDING'
                            ? alertCircleOutline
                            : closeCircleOutline
                        }
                        style={{ fontSize: '2rem', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                          Claim Assessment Prediction
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                          {assessment.approval_status === 'APPROVED'
                            ? 'CLAIM APPROVED'
                            : assessment.approval_status === 'DOCUMENTS_PENDING'
                            ? 'DOCUMENTS PENDING'
                            : 'CLAIM REJECTED'}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
                          {assessment.approval_status === 'APPROVED'
                            ? 'Valid policy coverage & IRDAI compliant damage claim.'
                            : assessment.rejection_reasons[0]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zero-Depreciation Indicator */}
                  {assessment && assessment.has_zero_dep && (
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1e40af',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>🛡️</span>
                      <span>Zero-Depreciation Add-on Active: Parts depreciation waived to 0%!</span>
                    </div>
                  )}

                  {/* Settlement Financial Audit Breakdown Table */}
                  {assessment && (
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Settlement Amount Breakdown
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>Gross Parts Claimed:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{assessment.total_parts_claimed.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#dc2626' }}>Less: Material Depreciation:</span>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>- ₹{assessment.total_parts_depreciation.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>Net Approved Parts:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{assessment.total_parts_approved.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>Labour Charges Approved:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{assessment.approved_labour.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#dc2626' }}>Less: Compulsory Excess:</span>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>- ₹{assessment.excess_deducted.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>18% GST on Net Payable:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>+ ₹{assessment.gst_amount.toLocaleString('en-IN')}</span>
                      </div>

                      <div style={{ margin: '10px 0', borderTop: '2px dashed #cbd5e1' }} />

                      {/* Highlighted Final Payout Box */}
                      <div
                        style={{
                          background: '#1e3a8a',
                          color: '#ffffff',
                          borderRadius: '10px',
                          padding: '14px',
                          textAlign: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                          Final Settlement Amount
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0' }}>
                          ₹{assessment.final_settlement_amount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          {claimType === 'CASHLESS' ? 'Paid Directly to Network Garage' : 'Reimbursed to Bank via NEFT'}
                        </div>
                      </div>

                      {/* Customer Liability */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#b91c1c' }}>
                        <span>Customer Out-of-Pocket Liability:</span>
                        <strong>₹{assessment.customer_liability.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  )}

                  {/* Previous Claims / NCB Impact Alert */}
                  {assessment && assessment.ncb_loss_warning && (
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fef3c7',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: '#92400e',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                      <span>{assessment.ncb_loss_warning}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={!assessment}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <IonIcon icon={downloadOutline} style={{ fontSize: '1.1rem', color: '#2563eb' }} />
                      Download Assessment Slip (PDF)
                    </button>

                    <button
                      onClick={handleSubmitClaim}
                      disabled={submitting || !assessment || assessment.approval_status === 'REJECTED'}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'none',
                        background:
                          assessment?.approval_status === 'REJECTED'
                            ? '#94a3b8'
                            : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: assessment?.approval_status === 'REJECTED' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      {submitting ? (
                        <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
                      ) : (
                        <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: '1.2rem' }} />
                      )}
                      Submit Formal Insurance Claim
                    </button>
                  </div>

                  {/* Success Banner */}
                  {submittedClaim && (
                    <div
                      style={{
                        marginTop: '16px',
                        background: '#ecfdf5',
                        border: '1px solid #6ee7b7',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '0.82rem',
                        color: '#065f46',
                      }}
                    >
                      <strong>Claim Registered Successfully!</strong>
                      <div style={{ marginTop: '3px' }}>Reference: <strong>{submittedClaim.claim_number}</strong></div>
                      <div>Surveyor Assigned: <strong>{submittedClaim.surveyor_name}</strong></div>
                    </div>
                  )}

                  {errorMessage && (
                    <div style={{ marginTop: '12px', color: '#dc2626', fontSize: '0.82rem', textAlign: 'center' }}>
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* TAB 2: DEALER & AUTHORIZED WORKSHOP PORTAL */}
          {activeTab === 'workshop' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                border: '1.5px solid #cbd5e1',
              }}
            >
              {/* Top Header & Fast Switch Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    🔧
                  </div>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <span>AUTHORIZED NETWORK GARAGE CONSOLE</span>
                    </div>
                    <h3 style={{ margin: '2px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                      Workshop Job Card & Digital Damage Estimator
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Enter damaged spare parts, labour charges, and generate IRDAI cashless estimate for insurance surveyor.
                    </p>
                  </div>
                </div>

                {/* Open Quick Accident Estimator Button (Option 2) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('estimator')}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <span>💥 Open Accident Claim Estimator</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('insured')}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                    }}
                  >
                    Insured Form
                  </button>
                </div>
              </div>

              {/* Job Card Details Bar */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Job Card Number
                  </label>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    JC-2026-8491
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Vehicle Inward
                  </label>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {vehicle?.registration_number || plateInput}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {vehicle?.maker_model || 'Yamaha FZ-S FI V4'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Service Advisor / Tech
                  </label>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    M. Saravanan (Lead Tech)
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Cashless Network Status
                  </label>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block' }}>
                    ✓ Pre-Approved Garage
                  </span>
                </div>
              </div>

              {/* Damaged Parts & Labour Entry Console (Option 3) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                {/* Left: Interactive Parts Entry & Table */}
                <div>
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      Add Replacement Spare Part
                    </h4>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPartName.trim() || !newPartAmount || Number(newPartAmount) <= 0) return;
                        const addedItem: PartInput = {
                          id: String(Date.now()),
                          name: newPartName.trim(),
                          category: newPartCategory,
                          amount: Number(newPartAmount),
                        };
                        const updatedParts = [...parts, addedItem];
                        setParts(updatedParts);
                        setNewPartName('');
                        setNewPartAmount('');
                        if (vehicle) runLiveCalculation(plateInput, vehicle);
                      }}
                      style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                    >
                      <input
                        type="text"
                        placeholder="Spare Part Name (e.g. Front Visor, Fender)"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        style={{
                          flex: 2,
                          minWidth: '180px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />

                      <select
                        value={newPartCategory}
                        onChange={(e) => setNewPartCategory(e.target.value as any)}
                        style={{
                          flex: 1.2,
                          minWidth: '140px',
                          padding: '9px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.82rem',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="PLASTIC">Plastic (50% Dep)</option>
                        <option value="RUBBER">Rubber (50% Dep)</option>
                        <option value="GLASS">Glass (0% Dep)</option>
                        <option value="FIBRE">Fibre (30% Dep)</option>
                        <option value="METAL">Metal (Age scale)</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={newPartAmount}
                        onChange={(e) => setNewPartAmount(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          width: '100px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />

                      <button
                        type="submit"
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '9px 16px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <IonIcon icon={addCircleOutline} />
                        Add Part
                      </button>
                    </form>
                  </div>

                  {/* Damaged Parts Table */}
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '20px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        Job Card Parts Estimation Sheet ({parts.length} items)
                      </h4>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px' }}>#</th>
                          <th style={{ padding: '10px 12px' }}>Description</th>
                          <th style={{ padding: '10px 12px' }}>Material</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>Cost</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts.map((item, idx) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  background: item.category === 'GLASS' ? '#eff6ff' : item.category === 'PLASTIC' ? '#fef3c7' : '#f1f5f9',
                                  color: item.category === 'GLASS' ? '#1d4ed8' : item.category === 'PLASTIC' ? '#b45309' : '#334155',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                }}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = parts.filter((p) => p.id !== item.id);
                                  setParts(updated);
                                  if (vehicle) runLiveCalculation(plateInput, vehicle);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                              >
                                <IonIcon icon={trashOutline} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Labour & Tinkering Cost Input */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        padding: '14px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', display: 'block' }}>
                          Workshop Labour, Denting & Painting:
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Includes mechanical inspection, panel alignment, and oven-bake paint.
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>₹</span>
                        <input
                          type="number"
                          value={labourAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setLabourAmount(val);
                            if (vehicle) runLiveCalculation(plateInput, vehicle);
                          }}
                          style={{
                            width: '110px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Real-time Workshop Invoice & Cashless Split Card */}
                <div>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      border: '1.5px solid #e2e8f0',
                      padding: '24px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.76rem' }}>
                        WORKSHOP ESTIMATE SUMMARY
                      </span>
                      <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.8rem' }}>
                        Live Calculated
                      </span>
                    </div>

                    {/* Breakdown */}
                    {(() => {
                      const totalSpares = parts.reduce((acc, p) => acc + p.amount, 0);
                      const totalBill = totalSpares + labourAmount;
                      const approvedInsurer = assessment ? assessment.final_settlement_amount : Math.max(0, totalBill - 4000);
                      const customerPay = assessment ? assessment.customer_liability : Math.max(0, totalBill - approvedInsurer);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.88rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Total Spare Parts:</span>
                            <strong style={{ color: '#0f172a' }}>₹{totalSpares.toLocaleString('en-IN')}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Workshop Labour:</span>
                            <strong style={{ color: '#0f172a' }}>₹{labourAmount.toLocaleString('en-IN')}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', color: '#0f172a', fontWeight: 800 }}>
                            <span>Gross Repair Bill:</span>
                            <span>₹{totalBill.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Cashless Payout Box */}
                          <div
                            style={{
                              background: '#ecfdf5',
                              border: '1.5px solid #86efac',
                              borderRadius: '12px',
                              padding: '14px',
                              marginTop: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ color: '#065f46', fontWeight: 800, fontSize: '0.84rem' }}>
                                Direct Insurer Cashless:
                              </span>
                              <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.25rem' }}>
                                ₹{approvedInsurer.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#047857' }}>
                              Disbursed directly to workshop bank account upon surveyor signoff.
                            </span>
                          </div>

                          {/* Customer Deductible Box */}
                          <div
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              padding: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.82rem' }}>
                              Customer Pay at Delivery:
                            </span>
                            <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.1rem' }}>
                              ₹{customerPay.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleSubmitClaim}
                        disabled={submitting}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        {submitting ? (
                          <>
                            <IonSpinner name="crescent" style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                            <span>Pushing to Surveyor...</span>
                          </>
                        ) : (
                          <>
                            <span>Push Job Card to Surveyor Desk</span>
                            <IonIcon icon={arrowForwardOutline} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={!assessment}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '10px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: !assessment ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <IonIcon icon={downloadOutline} />
                        <span>Download Workshop Job Card PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSURER & SURVEYOR APPROVAL DESK */}
          {activeTab === 'surveyor' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🛡️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Insurer & IRDAI Licensed Surveyor Approval Desk
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Digital surveyor assessment and fast-track claim approval/rejection console.
                    </p>
                  </div>
                </div>
                <button
                  onClick={loadAllClaims}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <IonIcon icon={refreshOutline} />
                  Refresh Queue
                </button>
              </div>

              {/* Claims Table */}
              {loadingClaims ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <IonSpinner name="crescent" />
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading claims queue...</p>
                </div>
              ) : claimsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>📭</span>
                  <p style={{ color: '#64748b', fontWeight: 600 }}>No claims registered yet. Go to Tab 1 to file a claim.</p>
                </div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px' }}>Claim Number</th>
                        <th style={{ padding: '12px 10px' }}>Vehicle Plate</th>
                        <th style={{ padding: '12px 10px' }}>Accident Date</th>
                        <th style={{ padding: '12px 10px' }}>Claim Type</th>
                        <th style={{ padding: '12px 10px' }}>Gross Claimed</th>
                        <th style={{ padding: '12px 10px' }}>Approved Settlement</th>
                        <th style={{ padding: '12px 10px' }}>Status</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Surveyor Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsList.map((c) => (
                        <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0', background: selectedSurveyorClaim?.id === c.id ? '#eff6ff' : '#ffffff' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e3a8a' }}>{c.claim_number}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 800 }}>{c.vehicle_reg_no}</td>
                          <td style={{ padding: '12px 10px', color: '#64748b' }}>{c.accident_date}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {c.claim_type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>₹{Number(c.total_claimed_amount).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 800, color: '#16a34a' }}>
                            ₹{Number(c.approved_settlement_amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background:
                                  c.status === 'APPROVED' || c.status === 'SETTLED'
                                    ? '#dcfce7'
                                    : c.status === 'REJECTED'
                                    ? '#fee2e2'
                                    : '#fef3c7',
                                color:
                                  c.status === 'APPROVED' || c.status === 'SETTLED'
                                    ? '#15803d'
                                    : c.status === 'REJECTED'
                                    ? '#b91c1c'
                                    : '#b45309',
                              }}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleSurveyorUpdateStatus(c.claim_number, 'APPROVED')}
                                style={{
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleSurveyorUpdateStatus(c.claim_number, 'REJECTED')}
                                style={{
                                  background: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};
