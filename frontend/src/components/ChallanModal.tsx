import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonSpinner, IonBadge } from '@ionic/react';
import { closeOutline, receiptOutline, checkmarkCircle, alertCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { api, ChallanRecord } from '../services/api';

interface ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  regNo?: string;
}

export const ChallanModal: React.FC<ChallanModalProps> = ({
  isOpen,
  onClose,
  regNo = 'MH01AE8055',
}) => {
  const [currentReg, setCurrentReg] = useState(regNo);
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  const fetchChallans = async (plate: string) => {
    setLoading(true);
    try {
      const data = await api.getChallans(plate);
      setChallans(data);
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChallans(currentReg);
    }
  }, [isOpen, currentReg]);

  const handlePay = async (id: number) => {
    setPayingId(id);
    try {
      const res = await api.payChallan(id);
      setChallans((prev) => prev.map((c) => (c.id === id ? res.challan : c)));
    } catch (err) {
      console.error('Challan payment failed:', err);
    } finally {
      setPayingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingList = challans.filter((c) => c.status === 'PENDING');
  const totalPending = pendingList.reduce((sum, c) => sum + Number(c.fine_amount), 0);

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="sheet-drag-pill" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IonIcon icon={receiptOutline} style={{ color: '#2563eb', fontSize: '1.2rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Traffic E-Challans
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Vehicle: <strong className="number-plate-styled" style={{ fontSize: '0.82rem', padding: '1px 6px' }}>{currentReg}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem', color: '#64748b' }} />
          </button>
        </div>

        {/* Pending Banner */}
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: totalPending > 0 ? '#fef2f2' : '#ecfdf5', border: `1px solid ${totalPending > 0 ? '#fecaca' : '#a7f3d0'}`, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: totalPending > 0 ? '#991b1b' : '#166534', fontWeight: 700 }}>
              {totalPending > 0 ? 'Outstanding Penalties Due' : 'All Fines Settled'}
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: totalPending > 0 ? '#dc2626' : '#16a34a', fontFamily: 'Outfit' }}>
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Status</span>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: totalPending > 0 ? '#b91c1c' : '#15803d' }}>
              {pendingList.length} Pending
            </div>
          </div>
        </div>

        {/* Challans List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <IonSpinner name="crescent" style={{ color: '#2563eb' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {challans.map((c) => {
              const isPaid = c.status === 'PAID';
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1px solid ${isPaid ? '#dcfce7' : '#fee2e2'}`,
                    background: isPaid ? '#f0fdf4' : '#fff5f5',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Challan: {c.challan_number}</span>
                      <h4 style={{ margin: '2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                        {c.violation_title}
                      </h4>
                    </div>

                    <IonBadge style={{ '--background': isPaid ? '#dcfce7' : '#fee2e2', '--color': isPaid ? '#16a34a' : '#dc2626', fontSize: '0.7rem', fontWeight: 700 }}>
                      {isPaid ? 'PAID' : 'PENDING'}
                    </IonBadge>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                    📍 {c.offense_place} • {new Date(c.offense_date).toLocaleDateString('en-IN')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Fine Amount</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isPaid ? '#16a34a' : '#dc2626' }}>
                        ₹{Number(c.fine_amount).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {!isPaid ? (
                      <IonButton
                        onClick={() => handlePay(c.id)}
                        disabled={payingId === c.id}
                        style={{
                          '--background': '#dc2626',
                          '--color': '#ffffff',
                          '--border-radius': '8px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          height: '34px',
                        }}
                      >
                        {payingId === c.id ? <IonSpinner name="dots" /> : 'Pay Fine (PUT)'}
                      </IonButton>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IonIcon icon={checkmarkCircle} /> Ref: {c.payment_reference || 'PAID'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
