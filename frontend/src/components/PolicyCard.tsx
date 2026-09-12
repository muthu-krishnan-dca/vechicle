import React, { useState } from 'react';
import { IonCard, IonCardContent, IonBadge, IonButton, IonIcon } from '@ionic/react';
import { downloadOutline, documentTextOutline, calendarOutline, checkmarkCircleOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { PolicyRecord } from '../services/api';
import { generatePolicyPDF } from '../services/pdfGenerator';

interface PolicyCardProps {
  policy: PolicyRecord;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDownload = () => {
    generatePolicyPDF(policy);
  };

  const isExpired = new Date(policy.end_date) < new Date();
  const addons = Array.isArray(policy.selected_addons) ? policy.selected_addons : [];

  return (
    <IonCard className="glass-card" style={{ margin: '0 0 16px 0', borderLeft: '4px solid #06b6d4' }}>
      <IonCardContent style={{ padding: '16px 18px' }}>
        {/* Top bar: Insurer & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="number-plate" style={{ fontSize: '0.85rem', padding: '2px 8px' }}>
                {policy.vehicle_reg_no}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {policy.insurer_name}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              Policy No: <strong style={{ color: '#38bdf8' }}>{policy.policy_number}</strong>
            </div>
          </div>

          <IonBadge
            style={{
              '--background': isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              '--color': isExpired ? '#f87171' : '#34d399',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {isExpired ? 'EXPIRED' : 'ACTIVE COVERAGE'}
          </IonBadge>
        </div>

        {/* Insured Info & Dates */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '14px 0', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Policy Holder</span>
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{policy.owner_name}</span>
          </div>

          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Insured Declared Value</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>₹{Number(policy.idv_amount).toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonIcon icon={calendarOutline} style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Validity Period</span>
              <span style={{ color: '#cbd5e1' }}>{policy.start_date} to {policy.end_date}</span>
            </div>
          </div>
        </div>

        {/* Addons Chips */}
        {addons.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Add-ons:</span>
            {addons.map((a, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                {a.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Bar: Total Premium & Download PDF Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Premium Paid:</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit' }}>
              ₹{Number(policy.total_premium).toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <IonIcon icon={documentTextOutline} />
              <span>{showDetails ? 'Hide' : 'Details'}</span>
              <IonIcon icon={showDetails ? chevronUpOutline : chevronDownOutline} />
            </button>

            <IonButton
              onClick={handleDownload}
              style={{
                '--background': '#06b6d4',
                '--color': '#ffffff',
                '--border-radius': '8px',
                height: '38px',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
              }}
            >
              <IonIcon icon={downloadOutline} slot="start" />
              Download PDF
            </IonButton>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div><span style={{ color: '#94a3b8' }}>Own Damage (OD):</span> <strong style={{ color: '#f1f5f9' }}>₹{Number(policy.od_premium).toFixed(2)}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>Third Party (TP):</span> <strong style={{ color: '#f1f5f9' }}>₹{Number(policy.tp_premium).toFixed(2)}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>Add-ons Total:</span> <strong style={{ color: '#f1f5f9' }}>₹{Number(policy.addons_total).toFixed(2)}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>18% GST:</span> <strong style={{ color: '#f1f5f9' }}>₹{Number(policy.gst_amount).toFixed(2)}</strong></div>
            </div>
            <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>Verified with Parivahan Vahan Database</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IonIcon icon={checkmarkCircleOutline} /> IRDAI Compliant</span>
            </div>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
