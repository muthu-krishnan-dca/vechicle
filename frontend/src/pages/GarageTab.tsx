import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
  IonButton,
  IonBadge,
  IonSpinner,
} from '@ionic/react';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  downloadOutline,
  checkmarkCircle,
  trashOutline,
  receiptOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VehicleSearchBar } from '../components/VehicleSearchBar';
import { ChallanModal } from '../components/ChallanModal';
import { api, VehicleRecord, PolicyRecord } from '../services/api';
import { generatePolicyPDF } from '../services/pdfGenerator';

export const GarageTab: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [vaultPolicies, setVaultPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState('MH01AE8055');

  // Load default demo vehicle in garage
  useEffect(() => {
    loadGarage();
  }, []);

  const loadGarage = async () => {
    setLoading(true);
    try {
      // Fetch Hunter 350 as active garage vehicle
      const v = await api.getVehicleRC('MH01AE8055');
      if (v) setVehicles([v]);

      const policies = await api.getVaultPolicies();
      setVaultPolicies(policies);
    } catch (err) {
      console.error('Garage load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (plate: string) => {
    setLoading(true);
    try {
      const v = await api.getVehicleRC(plate);
      if (v && !vehicles.some((item) => item.registration_number === v.registration_number)) {
        setVehicles([v, ...vehicles]);
      }
    } catch (err) {
      console.error('Failed to add vehicle to garage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = (regNo: string) => {
    setVehicles(vehicles.filter((v) => v.registration_number !== regNo));
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>
      <IonContent fullscreen style={{ '--background': '#ffffff' }}>
        <div className="app-content-container">
          {/* Top Back / Title Bar (matching Screenshot 4) */}
          <div style={{ padding: '8px 0 18px 0', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' }}>
            <button
              onClick={() => navigate('/home')}
              style={{ background: 'none', border: 'none', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '1.5rem' }} />
            </button>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
              My Garage & Digital Vault
            </h2>
          </div>

          {/* Empty State Banner (matching Screenshot 4) */}
          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px 40px 24px', maxWidth: '600px', margin: '0 auto' }}>
              {/* 3D House / Garage Graphic */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                <div style={{ width: '95px', height: '95px', background: '#fef3c7', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.8rem', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)' }}>
                  🏠
                </div>
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.45rem', fontWeight: 800, color: '#1e293b' }}>
                Your garage is empty
              </h3>

              <p style={{ margin: '0 0 28px 0', fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5 }}>
                Add your vehicle for automated reminders on Insurance, Challan, PUC validity and policy renewals
              </p>

              {/* Number Plate Search Bar */}
              <VehicleSearchBar
                onSearch={handleAddVehicle}
                placeholder="(e.g. MH 01 AE 8055)"
                showChips={true}
              />
            </div>
          ) : (
            <div>
              {/* Add Another Vehicle Search Box & Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <VehicleSearchBar
                    onSearch={handleAddVehicle}
                    placeholder="Add another bike or car (e.g. TN 09 AZ 4321)..."
                    showChips={false}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="white-card" style={{ flex: 1, margin: 0, padding: '14px 16px', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1d4ed8' }}>{vehicles.length}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af' }}>Vehicles in Garage</div>
                  </div>
                  <div className="white-card" style={{ flex: 1, margin: 0, padding: '14px 16px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{vaultPolicies.length}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534' }}>Covered Policies</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  Vehicles in My Garage ({vehicles.length})
                </h3>
              </div>

              {/* Added Vehicle Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px', marginBottom: '36px' }}>
                {vehicles.map((v) => {
                  const isInsured = v.insurance_status === 'ACTIVE';
                  return (
                    <div key={v.registration_number} className="white-card" style={{ margin: 0, border: '1.5px solid #dbeafe', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="number-plate-styled" style={{ fontSize: '1rem', padding: '3px 10px' }}>
                            {v.registration_number}
                          </span>
                          <h4 style={{ margin: '8px 0 2px 0', fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                            {v.maker_model}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {v.vehicle_class} • {v.fuel_type} • {v.engine_capacity_cc}cc
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveVehicle(v.registration_number)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Remove vehicle"
                        >
                          <IonIcon icon={trashOutline} style={{ fontSize: '1.05rem' }} />
                        </button>
                      </div>

                      {/* Status Badges */}
                      <div style={{ display: 'flex', gap: '8px', margin: '14px 0', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: isInsured ? '#f0fdf4' : '#fef2f2',
                            color: isInsured ? '#16a34a' : '#ef4444',
                            border: `1px solid ${isInsured ? '#bbf7d0' : '#fecaca'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <IonIcon icon={isInsured ? checkmarkCircle : alertCircleOutline} />
                          Insurance: {isInsured ? 'Valid' : 'Expired'}
                        </span>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          PUCC: {v.pucc_upto || 'Valid'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                        <IonButton
                          onClick={() => navigate('/insurance')}
                          style={{
                            flex: 1,
                            '--background': '#2563eb',
                            '--color': '#ffffff',
                            '--border-radius': '10px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            height: '38px',
                          }}
                        >
                          Renew Insurance
                        </IonButton>

                        <IonButton
                          fill="outline"
                          onClick={() => {
                            setSelectedPlate(v.registration_number);
                            setShowChallanModal(true);
                          }}
                          style={{
                            flex: 1,
                            '--border-color': '#cbd5e1',
                            '--color': '#334155',
                            '--border-radius': '10px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            height: '38px',
                          }}
                        >
                          <IonIcon icon={receiptOutline} slot="start" />
                          Check Challans
                        </IonButton>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Policy Vault Section */}
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                      Digital Policy Vault
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Official IRDAI Form 51 Certificates
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px' }}>
                    {vaultPolicies.length} Policies Available
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                  {vaultPolicies.map((p) => (
                    <div key={p.id} className="white-card" style={{ margin: 0, padding: '16px 18px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="number-plate-styled" style={{ fontSize: '0.84rem', padding: '2px 8px' }}>
                            {p.vehicle_reg_no}
                          </span>
                          <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                            {p.insurer_name}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Policy: <strong>{p.policy_number}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Premium Paid</span>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                            ₹{Number(p.total_premium).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Valid upto {p.end_date}
                        </span>

                        <IonButton
                          onClick={() => generatePolicyPDF(p)}
                          style={{
                            '--background': '#0ea5e9',
                            '--color': '#ffffff',
                            '--border-radius': '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            height: '36px',
                          }}
                        >
                          <IonIcon icon={downloadOutline} slot="start" />
                          Download PDF
                        </IonButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Official Footer */}
        <Footer />

        {/* Challan Modal */}
        <ChallanModal
          isOpen={showChallanModal}
          onClose={() => setShowChallanModal(false)}
          regNo={selectedPlate}
        />
      </IonContent>
    </IonPage>
  );
};
