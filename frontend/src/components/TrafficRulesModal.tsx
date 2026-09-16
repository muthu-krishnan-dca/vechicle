import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  searchOutline,
  warningOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
} from 'ionicons/icons';

interface TrafficRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    offense: 'Drunken Driving (DUI / DWI)',
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
    offense: 'Over Speeding (Light Motor Vehicle - LMV)',
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
];

export const TrafficRulesModal: React.FC<TrafficRulesModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Safety', 'Driving Violation', 'Documentation', 'Pollution & Vehicle'];

  const filtered = PENALTIES_DATA.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    if (!matchCat) return false;
    if (!query) return true;
    return (
      p.offense.toLowerCase().includes(query.toLowerCase()) ||
      p.section.toLowerCase().includes(query.toLowerCase()) ||
      p.newFine.toLowerCase().includes(query.toLowerCase())
    );
  });

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
          maxWidth: '840px',
          height: '88vh',
          maxHeight: '800px',
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
            background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
            color: '#ffffff',
            padding: '18px 24px',
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
              🚦
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                  Traffic Rules & Penalties Directory
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
                  MV Act 2019 / 2026
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#ffedd5' }}>
                Official traffic offense penalties, section numbers, and license suspension norms
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

        {/* Pinned Search & Filter */}
        <div style={{ background: '#ffffff', padding: '14px 24px', borderBottom: '1.5px solid #e2e8f0' }}>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <IonIcon
              icon={searchOutline}
              style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8', fontSize: '1.2rem' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search offense (e.g. Helmet, Seatbelt, Drunk driving, Signal jump, License)..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                background: '#f8fafc',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: `1.5px solid ${selectedCategory === c ? '#ea580c' : '#e2e8f0'}`,
                  background: selectedCategory === c ? '#fff7ed' : '#ffffff',
                  color: selectedCategory === c ? '#c2410c' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: selectedCategory === c ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* List Body */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {filtered.map((item, idx) => (
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
                      ⚠️ Repeat: {item.repeatOffense}
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
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            color: '#64748b',
          }}
        >
          <span>Under Motor Vehicles (Amendment) Act 2019 / MoRTH Guidelines</span>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '6px 18px',
              borderRadius: '8px',
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
