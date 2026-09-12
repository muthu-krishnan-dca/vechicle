import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';

interface VehicleSearchBarProps {
  onSearch: (plate: string) => void;
  initialValue?: string;
  placeholder?: string;
  showChips?: boolean;
}

export const VehicleSearchBar: React.FC<VehicleSearchBarProps> = ({
  onSearch,
  initialValue = '',
  placeholder = '(e.g. AB 12 CD 3456)',
  showChips = true,
}) => {
  const [plate, setPlate] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plate.trim()) {
      onSearch(plate.trim().toUpperCase());
    }
  };

  const handleChipClick = (samplePlate: string) => {
    setPlate(samplePlate);
    onSearch(samplePlate);
  };

  const samplePlates = [
    { plate: 'MH01AE8055', label: 'Hunter 350' },
    { plate: 'DL01AB1234', label: 'Yamaha MT-15' },
    { plate: 'TN09AZ4321', label: 'Activa 6G' },
    { plate: 'KA05MH9999', label: 'KTM 390' },
  ];

  return (
    <div className="floating-search-container">
      {/* Label Bubble floating above */}
      <div className="search-label-bubble">
        Enter your vehicle number
      </div>

      {/* Floating Pill Search Bar */}
      <form onSubmit={handleSubmit} className="plate-search-box">
        {/* Left IND Badge */}
        <div className="ind-badge">
          <span className="ind-circle" />
          <span>IND</span>
        </div>

        {/* Input */}
        <input
          type="text"
          className="plate-input"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder={placeholder}
          maxLength={15}
        />

        {/* Search Icon Button */}
        <button type="submit" className="plate-search-btn" title="Search Vehicle">
          <IonIcon icon={searchOutline} />
        </button>
      </form>

      {/* Quick Sample Plates */}
      {showChips && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', padding: '2px 4px', scrollbarWidth: 'none' }}>
          {samplePlates.map((s) => (
            <button
              key={s.plate}
              type="button"
              onClick={() => handleChipClick(s.plate)}
              style={{
                background: plate === s.plate ? '#eff6ff' : '#ffffff',
                border: `1px solid ${plate === s.plate ? '#2563eb' : '#e2e8f0'}`,
                color: plate === s.plate ? '#1d4ed8' : '#64748b',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              {s.plate} ({s.label})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
