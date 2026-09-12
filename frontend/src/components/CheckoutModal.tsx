import React, { useState } from 'react';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { closeOutline, checkmarkCircle, shieldCheckmarkOutline, documentTextOutline, downloadOutline, cardOutline, qrCodeOutline } from 'ionicons/icons';
import confetti from 'canvas-confetti';
import { InsurerQuote, api, PolicyRecord } from '../services/api';
import { generatePolicyPDF } from '../services/pdfGenerator';

interface CheckoutModalProps {
  quote: InsurerQuote;
  vehicleRegNo: string;
  onClose: () => void;
  onSuccess: (policy: PolicyRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  quote,
  vehicleRegNo,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [ownerName, setOwnerName] = useState('Rohit Sharma');
  const [ownerEmail, setOwnerEmail] = useState('rohit.sharma@example.com');
  const [ownerPhone, setOwnerPhone] = useState('+91 98201 44552');
  const [nomineeName, setNomineeName] = useState('Ritika Sajdeh');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedPolicy, setIssuedPolicy] = useState<PolicyRecord | null>(null);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleFinalPayment = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicle_reg_no: vehicleRegNo || 'MH01AE8055',
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        insurer_name: quote.insurer_name,
        plan_name: `Comprehensive 2-Wheeler Cover (${quote.short_name})`,
        engine_capacity_cc: 150,
        idv_amount: quote.idv,
        ncb_percent: quote.ncb_percent,
        od_premium: quote.od_net,
        tp_premium: quote.tp_amount,
        addons_total: quote.addons_total,
        selected_addons: quote.selected_addons,
        net_premium: quote.net_premium,
        gst_amount: quote.gst_amount,
        total_premium: quote.total_premium,
      };

      const res = await api.checkoutPolicy(payload);
      const policyData: PolicyRecord = res.policy;
      setIssuedPolicy(policyData);
      setStep('success');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // ignore if canvas-confetti is not loaded
      }

      onSuccess(policyData);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to process policy checkout. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (issuedPolicy) {
      generatePolicyPDF(issuedPolicy);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: quote.brand_color }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              {step === 'success' ? 'Policy Issued Successfully!' : `Checkout: ${quote.short_name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem', display: 'flex' }}
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment}>
              {/* Order Summary Bar */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Vehicle Registration</div>
                    <span className="number-plate" style={{ fontSize: '0.95rem', padding: '2px 8px', marginTop: '2px' }}>
                      {vehicleRegNo || 'MH01AE8055'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Payable</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Outfit' }}>
                      ₹{Math.round(quote.total_premium).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>
                1. Vehicle Owner & Nominee Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Email Address (Policy Document will be sent here) *
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Nominee Full Name (for PA Cover) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Relationship with Nominee *
                  </label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <IonButton
                  fill="outline"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    '--border-color': 'rgba(255, 255, 255, 0.2)',
                    '--color': '#cbd5e1',
                    '--border-radius': '10px',
                    height: '44px',
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  type="submit"
                  style={{
                    flex: 2,
                    '--background': '#06b6d4',
                    '--color': '#ffffff',
                    '--border-radius': '10px',
                    height: '44px',
                    fontWeight: 700,
                  }}
                >
                  Proceed to Payment
                </IonButton>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>
                2. Select Payment Mode
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1.5px solid ${paymentMethod === 'upi' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: paymentMethod === 'upi' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(30, 41, 59, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={qrCodeOutline} style={{ fontSize: '1.5rem', color: '#06b6d4' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>Instant UPI (GPay / PhonePe / Paytm)</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero transaction charges & instant policy issuance</div>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'upi'} readOnly />
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1.5px solid ${paymentMethod === 'card' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: paymentMethod === 'card' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(30, 41, 59, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={cardOutline} style={{ fontSize: '1.5rem', color: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>Credit / Debit Card</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Visa, MasterCard, RuPay, Maestro</div>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'card'} readOnly />
                </div>
              </div>

              {/* Security Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px' }}>
                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#10b981', fontSize: '1.3rem' }} />
                <span style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
                  256-Bit Encrypted Payment. Official IRDAI Motor Insurance Regulation CMVR Form 51.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <IonButton
                  fill="outline"
                  onClick={() => setStep('details')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    '--border-color': 'rgba(255, 255, 255, 0.2)',
                    '--color': '#cbd5e1',
                    '--border-radius': '10px',
                    height: '44px',
                  }}
                >
                  Back
                </IonButton>
                <IonButton
                  onClick={handleFinalPayment}
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    '--background': '#10b981',
                    '--background-hover': '#059669',
                    '--color': '#ffffff',
                    '--border-radius': '10px',
                    height: '44px',
                    fontWeight: 700,
                  }}
                >
                  {isSubmitting ? (
                    <IonSpinner name="dots" />
                  ) : (
                    `Pay ₹${Math.round(quote.total_premium).toLocaleString('en-IN')} & Issue Policy`
                  )}
                </IonButton>
              </div>
            </div>
          )}

          {step === 'success' && issuedPolicy && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <IonIcon icon={checkmarkCircle} style={{ fontSize: '4.5rem', color: '#10b981', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit' }}>
                Insurance Policy Activated!
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Your digital policy schedule and IRDAI Form 51 Certificate are ready.
              </p>

              {/* Policy Receipt Card */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Policy Number</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>{issuedPolicy.policy_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vehicle Regn</span>
                  <span className="number-plate" style={{ fontSize: '0.82rem', padding: '2px 6px' }}>{issuedPolicy.vehicle_reg_no}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Insurer</span>
                  <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>{issuedPolicy.insurer_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Validity Period</span>
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                    {issuedPolicy.start_date} to {issuedPolicy.end_date}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Premium Paid</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    ₹{Number(issuedPolicy.total_premium).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <IonButton
                  onClick={handleDownloadPDF}
                  style={{
                    '--background': '#06b6d4',
                    '--color': '#ffffff',
                    '--border-radius': '10px',
                    height: '46px',
                    fontWeight: 700,
                  }}
                >
                  <IonIcon icon={downloadOutline} slot="start" />
                  Download IRDAI Certificate (PDF)
                </IonButton>

                <IonButton
                  fill="outline"
                  onClick={onClose}
                  style={{
                    '--border-color': 'rgba(255, 255, 255, 0.2)',
                    '--color': '#cbd5e1',
                    '--border-radius': '10px',
                    height: '42px',
                  }}
                >
                  <IonIcon icon={documentTextOutline} slot="start" />
                  Done / View in Vault
                </IonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
