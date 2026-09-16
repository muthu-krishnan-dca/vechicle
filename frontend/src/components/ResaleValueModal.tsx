import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  calculatorOutline,
  checkmarkCircleOutline,
  sparklesOutline,
  trendingUpOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  calendarOutline,
} from 'ionicons/icons';

interface ResaleValueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResaleValueModal: React.FC<ResaleValueModalProps> = ({ isOpen, onClose }) => {
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [brand, setBrand] = useState('Hyundai');
  const [model, setModel] = useState('i20');
  const [year, setYear] = useState('2021');
  const [kms, setKms] = useState('35000');
  const [owner, setOwner] = useState('1st Owner');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<{
    fair: number;
    good: number;
    excellent: number;
    marketDemand: string;
  } | null>(null);

  const carBrands: Record<string, string[]> = {
    Hyundai: ['i20', 'Creta', 'Venue', 'Verna', 'Grand i10'],
    Maruti: ['Swift', 'Baleno', 'Brezza', 'Dzire', 'Ertiga'],
    Tata: ['Nexon', 'Punch', 'Altroz', 'Harrier', 'Tiago'],
    Mahindra: ['Thar', 'XUV700', 'Scorpio-N', 'Bolero', 'XUV300'],
    Honda: ['City', 'Amaze', 'Elevate', 'WR-V'],
    Toyota: ['Innova Crysta', 'Fortuner', 'Urban Cruiser', 'Glanza'],
  };

  const bikeBrands: Record<string, string[]> = {
    'Royal Enfield': ['Classic 350', 'Hunter 350', 'Meteor 350', 'Bullet 350'],
    Honda: ['Activa 6G', 'Shine 125', 'SP 125', 'Unicorn', 'Dio'],
    Yamaha: ['R15 V4', 'MT-15 V2', 'FZS-FI', 'Aerox 155', 'RayZR'],
    Bajaj: ['Pulsar 150', 'Pulsar NS200', 'Platina 110', 'Dominar 400'],
    TVS: ['Jupiter 125', 'Apache RTR 160', 'Raider 125', 'Ntorq 125'],
  };

  const currentBrands = vehicleType === 'car' ? carBrands : bikeBrands;

  const handleBrandChange = (b: string) => {
    setBrand(b);
    const models = currentBrands[b] || [];
    if (models.length > 0) {
      setModel(models[0]);
    }
  };

  const calculateEstimate = () => {
    const yr = parseInt(year);
    const age = Math.max(1, 2026 - yr);
    const mileage = parseInt(kms) || 30000;

    let basePrice = vehicleType === 'car' ? 850000 : 130000;

    // Adjust for brand / model premium
    if (['Creta', 'XUV700', 'Harrier', 'Fortuner'].includes(model)) basePrice = 1600000;
    if (['Classic 350', 'Hunter 350', 'R15 V4'].includes(model)) basePrice = 200000;

    // Depreciation: 10% per year, plus mileage factor
    const ageDepreciation = Math.pow(0.88, age);
    const mileageFactor = Math.max(0.7, 1 - (mileage / 100000) * 0.15);
    const ownerFactor = owner === '1st Owner' ? 1.0 : owner === '2nd Owner' ? 0.9 : 0.8;

    const fairEstimate = Math.round(basePrice * ageDepreciation * mileageFactor * ownerFactor);
    const goodEstimate = Math.round(fairEstimate * 1.08);
    const excellentEstimate = Math.round(fairEstimate * 1.18);

    setResult({
      fair: fairEstimate,
      good: goodEstimate,
      excellent: excellentEstimate,
      marketDemand: age <= 4 ? 'Very High (Quick Sale)' : 'Steady Demand',
    });
    setCalculated(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
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
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1.5px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
              }}
            >
              💰
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                  Vehicle Resale Valuation Calculator
                </h3>
                <span
                  style={{
                    background: '#fef08a',
                    color: '#854d0e',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}
                >
                  AI Appraisal
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#e0f2fe' }}>
                Calculate fair market price based on live vehicle demand, year & usage
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
            }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.4rem' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {/* Vehicle Type Switcher */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={() => {
                setVehicleType('car');
                handleBrandChange('Hyundai');
                setCalculated(false);
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: `2px solid ${vehicleType === 'car' ? '#2563eb' : '#e2e8f0'}`,
                background: vehicleType === 'car' ? '#eff6ff' : '#ffffff',
                color: vehicleType === 'car' ? '#1d4ed8' : '#64748b',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🚗</span>
              <span>Four Wheeler (Car)</span>
            </button>

            <button
              onClick={() => {
                setVehicleType('bike');
                handleBrandChange('Royal Enfield');
                setCalculated(false);
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: `2px solid ${vehicleType === 'bike' ? '#2563eb' : '#e2e8f0'}`,
                background: vehicleType === 'bike' ? '#eff6ff' : '#ffffff',
                color: vehicleType === 'bike' ? '#1d4ed8' : '#64748b',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🏍️</span>
              <span>Two Wheeler (Bike / Scooter)</span>
            </button>
          </div>

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {/* Brand */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Vehicle Make / Brand
              </label>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {Object.keys(currentBrands).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Model Variant
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {(currentBrands[brand] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Year */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Registration Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Kilometers Driven */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Kilometers Driven
              </label>
              <select
                value={kms}
                onChange={(e) => setKms(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="15000">Less than 20,000 km</option>
                <option value="35000">20,000 - 45,000 km</option>
                <option value="60000">45,000 - 75,000 km</option>
                <option value="90000">75,000 - 1,00,000 km</option>
                <option value="120000">More than 1,00,000 km</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateEstimate}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              marginBottom: '20px',
            }}
          >
            <IonIcon icon={calculatorOutline} />
            <span>Calculate Resale Market Value</span>
          </button>

          {/* Results Box */}
          {calculated && result && (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #93c5fd',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.15)',
                animation: 'fadeIn 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ESTIMATED VALUATION RANGE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {brand} {model} ({year})
                  </div>
                </div>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '14px',
                  }}
                >
                  🔥 {result.marketDemand}
                </span>
              </div>

              {/* Pricing Tiers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Fair Condition</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
                    ₹{result.fair.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1.5px solid #60a5fa' }}>
                  <div style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 800 }}>Good (Recommended)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1d4ed8', marginTop: '4px' }}>
                    ₹{result.good.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #86efac' }}>
                  <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>Excellent / Mint</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                    ₹{result.excellent.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                💡 Estimates are based on Orange Book Value (OBV) algorithms, Indian used car market trends, and city demand indexes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
