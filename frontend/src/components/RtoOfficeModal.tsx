import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  searchOutline,
  locationOutline,
  callOutline,
  timeOutline,
  documentTextOutline,
  mapOutline,
  downloadOutline,
  informationCircleOutline,
  businessOutline,
  navigateOutline,
  refreshOutline,
  copyOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import {
  ALL_INDIA_RTO_OFFICES,
  RtoOfficeItem,
  calculateDistanceKm,
} from '../data/rtoOfficesData';

export interface RtoFormItem {
  formNo: string;
  title: string;
  category: string;
  purpose: string;
  requiredDocs: string[];
  pdfUrl: string;
}

const RTO_FORMS_DATA: RtoFormItem[] = [
  {
    formNo: 'Form 20',
    title: 'Application for Registration of Motor Vehicle',
    category: 'RC Registration',
    purpose: 'Mandatory form submitted to RTO for new vehicle registration number and smart card RC issuance.',
    requiredDocs: [
      'Sale Certificate (Form 21)',
      'Roadworthiness Certificate (Form 22)',
      'Valid Motor Insurance Policy',
      'Address Proof (Aadhaar / Voter ID)',
      'Customs clearance (for imported vehicles)',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form20.pdf',
  },
  {
    formNo: 'Form 26',
    title: 'Intimation of Loss & Duplicate RC Application',
    category: 'Lost RC / Duplicate',
    purpose: 'Used to obtain a Duplicate Registration Certificate (RC) in case of theft, destruction, or physical damage.',
    requiredDocs: [
      'Police Non-Cognizable Report (NCR) / FIR copy',
      'Valid Vehicle Insurance Certificate',
      'Pollution Under Control (PUC) Certificate',
      'Identity & Address proof of owner',
      'Financier NOC (if hypothecated)',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form26.pdf',
  },
  {
    formNo: 'Form 28',
    title: 'Application for No Objection Certificate (NOC)',
    category: 'Inter-State Transfer',
    purpose: 'Required when moving vehicle permanently from one state / RTO jurisdiction to another state.',
    requiredDocs: [
      'Original RC Book / Smart Card',
      'Valid PUC Certificate',
      'Valid Insurance Certificate',
      'Clearance from local Police Authority / Traffic police',
      'Financier NOC (if active loan)',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form28.pdf',
  },
  {
    formNo: 'Form 29',
    title: 'Notice of Transfer of Ownership of a Motor Vehicle',
    category: 'Ownership Transfer',
    purpose: 'Seller declaration confirming vehicle sale and handover to buyer.',
    requiredDocs: [
      'Buyer & Seller Passport Photos',
      'PAN Card / Form 60',
      'Chassis pencil print on form',
      'Copy of Sale Agreement',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form29.pdf',
  },
  {
    formNo: 'Form 30',
    title: 'Application for Transfer of Ownership of Motor Vehicle',
    category: 'Ownership Transfer',
    purpose: 'Form submitted by buyer to endorse change of vehicle ownership in Parivahan database.',
    requiredDocs: [
      'Original Registration Certificate (RC)',
      'Form 29 signed in duplicate',
      'Valid Insurance endorsed to buyer',
      'Valid PUC Certificate',
      'Buyer Address Proof (Aadhaar / Passport)',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form30.pdf',
  },
  {
    formNo: 'Form 33',
    title: 'Intimation of Change of Address in RC',
    category: 'Address Update',
    purpose: 'Used to update registered residential or business address on RC within 30 days of relocating.',
    requiredDocs: [
      'Original RC Book / Smart card',
      'New Address Proof (Electricity bill / Aadhaar / Rent agreement)',
      'Valid PUC & Insurance',
      'Financier NOC (if under hypothecation)',
    ],
    pdfUrl: 'https://parivahan.gov.in/parivahan/sites/default/files/DownloadForms/form33.pdf',
  },
];

interface RtoOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
}

export const RtoOfficeModal: React.FC<RtoOfficeModalProps> = ({
  isOpen,
  onClose,
  defaultCity = '',
}) => {
  const [activeTab, setActiveTab] = useState<'offices' | 'forms'>('offices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // GPS / Nearby Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  // Auto-fill from saved city on open
  useEffect(() => {
    if (isOpen) {
      const savedCity = localStorage.getItem('user_city');
      if (savedCity && savedCity !== 'Live Location' && savedCity.toLowerCase() !== 'patna') {
        if (!searchQuery) {
          setSearchQuery(savedCity);
        }
      }
      if (localStorage.getItem('user_is_live') === 'true' && !userCoords) {
        handleDetectLocation();
      }
    }
  }, [isOpen]);

  const handleDetectLocation = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setIsLocating(false);
        setNearbyOnly(true);
        setSelectedState('All');
      },
      (err) => {
        setIsLocating(false);
        setGpsError('Could not get GPS fix. Please allow location access or search by city name.');
        console.warn('GPS error:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Compute offices with distance if GPS available
  const officesWithDistance = useMemo(() => {
    return ALL_INDIA_RTO_OFFICES.map((office) => {
      let distanceKm: number | null = null;
      if (userCoords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lon, office.lat, office.lon);
      }
      return {
        ...office,
        distanceKm,
      };
    });
  }, [userCoords]);

  // States list with counts
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_INDIA_RTO_OFFICES.length };
    ALL_INDIA_RTO_OFFICES.forEach((o) => {
      counts[o.state] = (counts[o.state] || 0) + 1;
    });
    return counts;
  }, []);

  const stateList = useMemo(() => {
    const keys = Object.keys(stateCounts).filter((k) => k !== 'All');
    keys.sort((a, b) => stateCounts[b] - stateCounts[a]);
    return ['All', ...keys];
  }, [stateCounts]);

  // Filter and sort offices
  const filteredOffices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const altQ = q.replace(/th/g, 't');

    let result = officesWithDistance.filter((item) => {
      if (nearbyOnly && item.distanceKm !== null && item.distanceKm > 60) {
        return false;
      }

      const matchState = selectedState === 'All' || item.state === selectedState;
      if (!matchState) return false;

      if (!q) return true;

      const matchText = (text: string) => {
        const lower = text.toLowerCase();
        const lowerNorm = lower.replace(/th/g, 't');
        return lower.includes(q) || lower.includes(altQ) || lowerNorm.includes(altQ);
      };

      return (
        matchText(item.code) ||
        matchText(item.name) ||
        matchText(item.city) ||
        matchText(item.state) ||
        matchText(item.address) ||
        item.pincode.includes(q) ||
        item.jurisdiction.some((j) => matchText(j))
      );
    });

    if (userCoords) {
      result.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return result;
  }, [officesWithDistance, searchQuery, selectedState, nearbyOnly, userCoords]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenMaps = (office: RtoOfficeItem) => {
    const query = encodeURIComponent(`${office.name}, ${office.address}, ${office.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (!isOpen) return null;

  // Use createPortal to mount directly to document.body, escaping any parent container clipping
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1020px',
          height: '88vh',
          maxHeight: '820px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1.5px solid #cbd5e1',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= FIXED TOP SECTION (NEVER SCROLLS) ================= */}
        <div style={{ flexShrink: 0 }}>
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0284c7 100%)',
              color: '#ffffff',
              padding: '16px 20px 14px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  🏢
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.2,
                      }}
                    >
                      All India RTO Directory & Official Forms
                    </h2>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.22)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      🇮🇳 Pan-India
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#e0f2fe', fontWeight: 500 }}>
                    Live GPS Nearby RTO finder, office timings, contact helpline & Parivahan forms
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: '1.35rem' }} />
              </button>
            </div>

            {/* Navigation Pill Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                background: 'rgba(15, 23, 42, 0.28)',
                padding: '3px',
                borderRadius: '10px',
                width: 'fit-content',
              }}
            >
              <button
                onClick={() => setActiveTab('offices')}
                style={{
                  border: 'none',
                  background: activeTab === 'offices' ? '#ffffff' : 'transparent',
                  color: activeTab === 'offices' ? '#1e3a8a' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'offices' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <IonIcon icon={businessOutline} />
                <span>RTO Offices ({filteredOffices.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('forms')}
                style={{
                  border: 'none',
                  background: activeTab === 'forms' ? '#ffffff' : 'transparent',
                  color: activeTab === 'forms' ? '#1e3a8a' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'forms' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <IonIcon icon={documentTextOutline} />
                <span>Official RTO Forms ({RTO_FORMS_DATA.length})</span>
              </button>
            </div>
          </div>

          {/* PINNED SEARCH & FILTER BAR (STAYS VISIBLE ALWAYS) */}
          {activeTab === 'offices' && (
            <div
              style={{
                background: '#ffffff',
                borderBottom: '1.5px solid #e2e8f0',
                padding: '12px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              {/* Row 1: Search Input + GPS Button */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IonIcon
                    icon={searchOutline}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: '#94a3b8',
                      fontSize: '1.2rem',
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setNearbyOnly(false);
                    }}
                    placeholder="Search RTO (e.g. TN-92, TN-96, Kovilpatti, Thiruchendur, Chennai, Bangalore)..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      background: '#f8fafc',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* GPS Button */}
                <button
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  style={{
                    background: userCoords ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 8px rgba(37, 99, 235, 0.22)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IonIcon
                    icon={isLocating ? refreshOutline : navigateOutline}
                    style={{ animation: isLocating ? 'spin 1s linear infinite' : 'none' }}
                  />
                  <span>
                    {isLocating ? 'Locating...' : userCoords ? '📍 GPS Active (Sorted)' : '📍 Find Near Me (GPS)'}
                  </span>
                </button>
              </div>

              {/* Row 2: GPS Status Bar if active */}
              {userCoords && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: '#166534',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛰️</span>
                    <span>
                      <strong>GPS Active:</strong> RTO offices sorted closest to your location first!
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setNearbyOnly(!nearbyOnly)}
                      style={{
                        background: nearbyOnly ? '#15803d' : '#ffffff',
                        color: nearbyOnly ? '#ffffff' : '#15803d',
                        border: '1px solid #16a34a',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {nearbyOnly ? '✓ Within 60km' : 'Filter < 60km'}
                    </button>
                    <button
                      onClick={() => {
                        setUserCoords(null);
                        setNearbyOnly(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Row 3: State Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginRight: '2px', flexShrink: 0 }}>
                  States:
                </span>
                {stateList.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedState(st);
                      setNearbyOnly(false);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: `1.5px solid ${selectedState === st ? '#2563eb' : '#e2e8f0'}`,
                      background: selectedState === st ? '#eff6ff' : '#ffffff',
                      color: selectedState === st ? '#1d4ed8' : '#475569',
                      fontSize: '0.76rem',
                      fontWeight: selectedState === st ? 800 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    {st} ({stateCounts[st] || 0})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= SCROLLABLE CARDS BODY ================= */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
          {activeTab === 'offices' ? (
            filteredOffices.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px dashed #cbd5e1',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                  No RTO Offices Found
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#64748b' }}>
                  No matching office for "<strong>{searchQuery}</strong>". Try searching another RTO code (e.g. TN-92, TN-96, TN-01) or city name.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedState('All');
                    setNearbyOnly(false);
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                  }}
                >
                  View All India RTOs
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                {filteredOffices.map((office, index) => {
                  const isClosest = userCoords && index === 0;

                  return (
                    <div
                      key={office.code}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: isClosest ? '2px solid #22c55e' : '1.5px solid #e2e8f0',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isClosest ? '0 6px 20px -4px rgba(34, 197, 94, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)',
                        position: 'relative',
                      }}
                    >
                      {isClosest && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-9px',
                            right: '14px',
                            background: '#16a34a',
                            color: '#ffffff',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        >
                          ⭐ CLOSEST TO YOU
                        </div>
                      )}

                      <div>
                        {/* Card Header: Code Badge + Distance / State */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              onClick={() => handleCopyCode(office.code)}
                              title="Click to copy RTO code"
                              style={{
                                background: '#eff6ff',
                                border: '1.5px solid #93c5fd',
                                color: '#1d4ed8',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                letterSpacing: '0.5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {office.code}
                              <IonIcon icon={copiedCode === office.code ? checkmarkOutline : copyOutline} style={{ fontSize: '0.75rem' }} />
                            </span>
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>
                              {office.city}, {office.state}
                            </span>
                          </div>

                          {office.distanceKm !== null ? (
                            <span
                              style={{
                                background: office.distanceKm < 15 ? '#ecfdf5' : '#f0f9ff',
                                border: `1px solid ${office.distanceKm < 15 ? '#86efac' : '#bae6fd'}`,
                                color: office.distanceKm < 15 ? '#15803d' : '#0369a1',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: '10px',
                              }}
                            >
                              📍 {office.distanceKm} km away
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#065f46',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                              Working
                            </span>
                          )}
                        </div>

                        {/* Office Name */}
                        <h4
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            fontFamily: 'Outfit, sans-serif',
                            lineHeight: 1.25,
                          }}
                        >
                          {office.name}
                        </h4>

                        {/* Address */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            fontSize: '0.78rem',
                            color: '#475569',
                            marginBottom: '6px',
                            lineHeight: 1.35,
                          }}
                        >
                          <IonIcon icon={locationOutline} style={{ color: '#2563eb', fontSize: '1rem', flexShrink: 0, marginTop: '1px' }} />
                          <span>
                            {office.address} - PIN {office.pincode}
                          </span>
                        </div>

                        {/* Timings */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginBottom: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <IonIcon icon={timeOutline} style={{ color: '#f59e0b', fontSize: '0.9rem', flexShrink: 0 }} />
                          <span>
                            <strong>Timings:</strong> {office.timings}
                          </span>
                        </div>

                        {/* Contact Info Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          <a
                            href={`tel:${office.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f1f5f9',
                              color: '#1e293b',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 7px',
                              borderRadius: '5px',
                              textDecoration: 'none',
                            }}
                          >
                            <IonIcon icon={callOutline} style={{ color: '#16a34a' }} />
                            {office.phone}
                          </a>

                          <a
                            href={`mailto:${office.email}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f1f5f9',
                              color: '#1e293b',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '3px 7px',
                              borderRadius: '5px',
                              textDecoration: 'none',
                            }}
                          >
                            ✉️ {office.email}
                          </a>
                        </div>

                        {/* Jurisdiction Tag List */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>
                            Jurisdiction Areas:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {office.jurisdiction.map((area, idx) => (
                              <span
                                key={idx}
                                onClick={() => setSearchQuery(area)}
                                title="Click to filter by this area"
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  color: '#334155',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Map Action Button */}
                      <button
                        onClick={() => handleOpenMaps(office)}
                        style={{
                          width: '100%',
                          background: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          color: '#1d4ed8',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                          marginTop: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
                      >
                        <IonIcon icon={mapOutline} />
                        <span>Get Directions on Google Maps</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Forms Tab */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
              {RTO_FORMS_DATA.map((form) => (
                <div
                  key={form.formNo}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        style={{
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          color: '#92400e',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {form.formNo}
                      </span>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '10px',
                        }}
                      >
                        {form.category}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {form.title}
                    </h4>

                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.35 }}>
                      {form.purpose}
                    </p>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        marginBottom: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#334155',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <IonIcon icon={informationCircleOutline} style={{ color: '#2563eb' }} />
                        <span>Documents Checklist Required:</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#475569' }}>
                        {form.requiredDocs.map((doc, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href={form.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      color: '#ffffff',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      boxShadow: '0 3px 8px rgba(37, 99, 235, 0.22)',
                    }}
                  >
                    <IonIcon icon={downloadOutline} />
                    <span>Download Official {form.formNo} (PDF)</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= FIXED FOOTER (NEVER SCROLLS) ================= */}
        <div
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: '#ffffff',
            borderTop: '1.5px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏛️</span>
            <span>Government of India & State Transport Directory ({ALL_INDIA_RTO_OFFICES.length} Verified RTOs)</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '6px 18px',
              borderRadius: '7px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.8rem',
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
