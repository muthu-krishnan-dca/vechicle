import React, { useState, useEffect } from 'react';
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

export const ClaimInsurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insured' | 'workshop' | 'surveyor'>('insured');

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

        {/* Multi-Stakeholder Tabs Navigation */}
        <div style={{ maxWidth: '1200px', margin: '-20px auto 24px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '6px',
            }}
          >
            <button
              onClick={() => setActiveTab('insured')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'insured' ? '#2563eb' : 'transparent',
                color: activeTab === 'insured' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={personCircleOutline} style={{ fontSize: '1.2rem' }} />
              <span>1. Insured / Policyholder</span>
            </button>

            <button
              onClick={() => setActiveTab('workshop')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'workshop' ? '#2563eb' : 'transparent',
                color: activeTab === 'workshop' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={buildOutline} style={{ fontSize: '1.2rem' }} />
              <span>2. Authorized Workshop / Dealer</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('surveyor');
                loadAllClaims();
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'surveyor' ? '#2563eb' : 'transparent',
                color: activeTab === 'surveyor' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <IonIcon icon={businessOutline} style={{ fontSize: '1.2rem' }} />
              <span>3. Insurer & Surveyor Desk</span>
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
          {/* TAB 1: INSURED / POLICYHOLDER CLAIM FILING & CALCULATION */}
          {activeTab === 'insured' && (
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
          )}

          {/* TAB 2: DEALER & AUTHORIZED WORKSHOP PORTAL */}
          {activeTab === 'workshop' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.6rem' }}>🔧</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Dealer & Authorized Network Workshop Desk
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Authorized dealer showroom & repair workshop console. Create cashless job cards and damage estimation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 700, color: '#1e3a8a' }}>
                    Cashless Repair Workflow
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                    <li>Vehicle arrival, physical inspection, and RC document verification.</li>
                    <li>Digital estimation recording spare parts categories (Plastic, Metal, Glass, Fibre).</li>
                    <li>Insurance surveyor digital spot inspection and fast-track approval.</li>
                    <li>Upon repair completion, approved insurance amount is disbursed directly to workshop.</li>
                    <li>Customer pays only standard compulsory excess and applicable material depreciation.</li>
                  </ol>
                </div>

                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 700, color: '#1e40af' }}>
                    Create Workshop Job Card
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '12px' }}>
                    Active Vehicle: <strong>{vehicle ? vehicle.registration_number : 'TN69BS3112'}</strong> ({vehicle?.maker_model})
                  </div>
                  <button
                    onClick={() => setActiveTab('insured')}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Open Repair Estimator</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
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
