import React from 'react';
import { IonIcon, IonButton, IonBadge } from '@ionic/react';
import { closeOutline, checkmarkCircle, alertCircleOutline, shieldCheckmarkOutline, arrowForwardOutline, receiptOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { VehicleRecord } from '../services/api';

interface RcDetailsModalProps {
  vehicle: VehicleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPayChallan?: () => void;
}

export const RcDetailsModal: React.FC<RcDetailsModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onPayChallan,
}) => {
  const navigate = useNavigate();
  if (!isOpen || !vehicle) return null;

  const isInsured = vehicle.insurance_status === 'ACTIVE';

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-pill" />

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="number-plate-styled">{vehicle.registration_number}</span>
              <IonBadge
                style={{
                  '--background': isInsured ? '#dcfce7' : '#fee2e2',
                  '--color': isInsured ? '#16a34a' : '#dc2626',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                {vehicle.insurance_status.replace('_', ' ')}
              </IonBadge>
            </div>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
              {vehicle.maker_model}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Registered RTO: {vehicle.rto_office}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem', color: '#64748b' }} />
          </button>
        </div>

        {/* 6 Key Specifications Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Owner Name</span>
            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{vehicle.masked_owner}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Engine Capacity</span>
            <strong style={{ fontSize: '0.88rem', color: '#2563eb' }}>{vehicle.engine_capacity_cc} CC</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Fuel / Class</span>
            <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>{vehicle.fuel_type} (2WN)</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Registration Date</span>
            <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>{vehicle.registration_date}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Fitness Valid Upto</span>
            <strong style={{ fontSize: '0.82rem', color: '#16a34a' }}>{vehicle.fitness_upto}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Insurance Upto</span>
            <strong style={{ fontSize: '0.82rem', color: isInsured ? '#16a34a' : '#dc2626' }}>{vehicle.insurance_upto}</strong>
          </div>
        </div>

        {/* PUC & RC Status Banner */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonIcon icon={checkmarkCircle} style={{ color: '#16a34a', fontSize: '1rem' }} />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534' }}>PUC Status: Valid</div>
              <div style={{ fontSize: '0.68rem', color: '#15803d' }}>Upto {vehicle.pucc_upto || '2027-01-10'}</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#2563eb', fontSize: '1rem' }} />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af' }}>RC Status: Active</div>
              <div style={{ fontSize: '0.68rem', color: '#1d4ed8' }}>Parivahan Certified</div>
            </div>
          </div>
        </div>

        {/* Pending Challan Alert if any */}
        {vehicle.pending_challans_count > 0 && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={alertCircleOutline} style={{ color: '#dc2626', fontSize: '1.3rem' }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991b1b' }}>
                  {vehicle.pending_challans_count} Pending Traffic Police Fines (₹{vehicle.pending_fines_total})
                </div>
                <div style={{ fontSize: '0.68rem', color: '#b91c1c' }}>Clear before vehicle renewal</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onPayChallan) onPayChallan();
                else navigate('/services');
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Pay Fine
            </button>
          </div>
        )}

        {/* Main CTA: Compare Insurance */}
        <IonButton
          expand="block"
          onClick={() => {
            onClose();
            navigate('/insurance');
          }}
          style={{
            '--background': '#2563eb',
            '--color': '#ffffff',
            '--border-radius': '12px',
            fontWeight: 800,
            fontSize: '0.92rem',
            height: '46px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          }}
        >
          Compare & Buy Bike Insurance
          <IonIcon icon={arrowForwardOutline} slot="end" />
        </IonButton>
      </div>
    </div>
  );
};
