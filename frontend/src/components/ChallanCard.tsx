import React, { useState } from 'react';
import { IonCard, IonCardContent, IonBadge, IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline, timeOutline, locationOutline, receiptOutline } from 'ionicons/icons';
import { ChallanRecord, api } from '../services/api';

interface ChallanCardProps {
  challan: ChallanRecord;
  onPaid: (updated: ChallanRecord) => void;
}

export const ChallanCard: React.FC<ChallanCardProps> = ({ challan, onPaid }) => {
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayNow = async () => {
    setIsPaying(true);
    setErrorMsg('');
    try {
      const res = await api.payChallan(challan.id);
      onPaid(res.challan);
    } catch (err) {
      console.error('Failed to pay challan:', err);
      setErrorMsg('Payment settlement failed. Please retry.');
    } finally {
      setIsPaying(false);
    }
  };

  const isPaid = challan.status === 'PAID';
  const fineAmt = Number(challan.fine_amount);

  return (
    <IonCard
      className="glass-card"
      style={{
        margin: '0 0 14px 0',
        borderLeft: `4px solid ${isPaid ? '#10b981' : '#ef4444'}`,
      }}
    >
      <IonCardContent style={{ padding: '16px 18px' }}>
        {/* Top Header: Challan No & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Challan No:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {challan.challan_number}
              </span>
            </div>
            <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              {challan.violation_title}
            </h4>
          </div>

          <IonBadge
            style={{
              '--background': isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              '--color': isPaid ? '#34d399' : '#f87171',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <IonIcon icon={isPaid ? checkmarkCircleOutline : alertCircleOutline} />
            {isPaid ? 'PAID & SETTLED' : 'PAYMENT PENDING'}
          </IonBadge>
        </div>

        {/* Violation Description */}
        <p style={{ margin: '8px 0 12px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
          {challan.violation_description}
        </p>

        {/* Location & Time Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '14px', fontSize: '0.78rem', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} style={{ color: '#06b6d4' }} />
            <span>{challan.offense_place}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={timeOutline} style={{ color: '#f59e0b' }} />
            <span>
              {new Date(challan.offense_date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Paid Details if Settled */}
        {isPaid && challan.payment_reference && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a7f3d0' }}>
              <IonIcon icon={receiptOutline} style={{ fontSize: '1rem' }} />
              <span>Payment Ref: <strong>{challan.payment_reference}</strong></span>
            </div>
            <span style={{ color: '#94a3b8' }}>
              {challan.paid_at ? new Date(challan.paid_at).toLocaleDateString('en-IN') : 'Settled Online'}
            </span>
          </div>
        )}

        {/* Bottom Bar: Amount & Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Penalty Amount:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isPaid ? '#10b981' : '#f87171', fontFamily: 'Outfit' }}>
              ₹{fineAmt.toLocaleString('en-IN')}
            </div>
          </div>

          {!isPaid && (
            <IonButton
              onClick={handlePayNow}
              disabled={isPaying}
              style={{
                '--background': '#ef4444',
                '--background-hover': '#dc2626',
                '--color': '#ffffff',
                '--border-radius': '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                height: '38px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              }}
            >
              {isPaying ? <IonSpinner name="dots" /> : 'Pay Fine Online (PUT)'}
            </IonButton>
          )}

          {isPaid && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IonIcon icon={checkmarkCircleOutline} /> Settled via Parivahan
            </span>
          )}
        </div>

        {errorMsg && (
          <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.78rem' }}>
            {errorMsg}
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
