import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  currentCity?: string;
  onCityChange?: (city: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity = 'New delhi',
  onCityChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const saved = localStorage.getItem('user_city');
    if (saved && saved.toLowerCase() !== 'patna' && saved.toLowerCase() !== 'new delhi') {
      return saved;
    }
    localStorage.removeItem('user_city');
    return 'Live Location';
  });
  const [isLiveLocation, setIsLiveLocation] = useState<boolean>(() => {
    return localStorage.getItem('user_is_live') === 'true';
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const cities = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tirunelveli',
    'Trichy',
    'Salem',
    'Bengaluru',
    'Kochi',
    'Hyderabad',
    'Mumbai',
    'New Delhi',
    'Pune',
    'Ahmedabad',
    'Kolkata',
  ];

  const detectLiveLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocationError('Geolocation is not supported by your browser. Please select your city below.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via BigDataCloud client API
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            const detected = data.city || data.locality || data.principalSubdivision;
            if (detected && detected.toLowerCase() !== 'patna') {
              const cleanCity = detected.trim();
              setSelectedCity(cleanCity);
              setIsLiveLocation(true);
              localStorage.setItem('user_city', cleanCity);
              localStorage.setItem('user_is_live', 'true');
              if (onCityChange) onCityChange(cleanCity);
              setIsLocating(false);
              return;
            }
          }
        } catch (e) {
          console.warn('BigDataCloud reverse geocode error:', e);
        }

        // Fallback to OpenStreetMap Nominatim with lat/lon
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detected = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district;
            if (detected && detected.toLowerCase() !== 'patna') {
              const cleanCity = detected.trim();
              setSelectedCity(cleanCity);
              setIsLiveLocation(true);
              localStorage.setItem('user_city', cleanCity);
              localStorage.setItem('user_is_live', 'true');
              if (onCityChange) onCityChange(cleanCity);
              setIsLocating(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Nominatim reverse geocode error:', e);
        }

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Please allow browser location permission to detect your live location, or choose your city below.');
        console.warn('Geolocation error / permission prompt skipped:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Purge any accidental Patna storage
    const saved = localStorage.getItem('user_city');
    if (saved && saved.toLowerCase() === 'patna') {
      localStorage.removeItem('user_city');
      localStorage.removeItem('user_is_live');
    }
    // Attempt device GPS on mount
    detectLiveLocation();
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setIsLiveLocation(false);
    localStorage.setItem('user_city', city);
    localStorage.setItem('user_is_live', 'false');
    setShowCityPicker(false);
    if (onCityChange) onCityChange(city);
  };

  const navTo = (path: string) => {
    setActiveDropdown(null);
    navigate(path);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header
        style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #fffdf5 60%, #fefce8 100%)',
          borderBottom: '1.5px solid #fef08a',
          padding: '10px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 4px 20px rgba(234, 179, 8, 0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand Logo & Tagline */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => navTo('/rc-search')}
          >
            {/* Tricolor Car Brand Emblem */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                {/* Top Orange Band */}
                <rect x="5" y="8" width="30" height="3.5" rx="1.75" fill="#FF7722" />
                {/* Bottom Green Band */}
                <rect x="5" y="28" width="30" height="3.5" rx="1.75" fill="#138808" />
                {/* Car Outline */}
                <path
                  d="M10 23L13 14H27L30 23V26H10V23Z"
                  fill="#2563eb"
                />
                <rect x="15" y="16" width="10" height="4" rx="1" fill="#ffffff" opacity="0.9" />
                {/* Wheels */}
                <circle cx="14" cy="26" r="3" fill="#1e293b" />
                <circle cx="26" cy="26" r="3" fill="#1e293b" />
                <circle cx="14" cy="26" r="1.2" fill="#ffffff" />
                <circle cx="26" cy="26" r="1.2" fill="#ffffff" />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Vehicle Info
                </span>
                {/* Blue Search Magnifier Icon dot */}
                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '2px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                ALL-IN-ONE VEHICLE SOLUTION
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links in Sleek Oval / Capsule shape */}
          <nav
            className="desktop-header-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(90deg, #ffffff 0%, #fffdf0 40%, #fef9c3 100%)',
              border: '1.5px solid #fde047',
              borderRadius: '9999px',
              padding: '4px 6px',
              boxShadow: '0 2px 14px rgba(202, 138, 4, 0.12)',
            }}
          >
            {/* Home */}
            <button
              onClick={() => navTo('/home')}
              style={{
                background: location.pathname === '/home' ? '#2563eb' : 'transparent',
                border: 'none',
                color: location.pathname === '/home' ? '#ffffff' : '#334155',
                fontSize: '0.92rem',
                fontWeight: 700,
                padding: '7px 18px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: location.pathname === '/home' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
              }}
            >
              Home
            </button>

            {/* Insurance Dropdown */}
            <div className="header-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'insurance' ? null : 'insurance');
                }}
                style={{
                  background: (location.pathname.includes('insurance') && location.pathname !== '/claim-insurance') ? '#2563eb' : 'transparent',
                  border: 'none',
                  color: (location.pathname.includes('insurance') && location.pathname !== '/claim-insurance') ? '#ffffff' : '#334155',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  boxShadow: (location.pathname.includes('insurance') && location.pathname !== '/claim-insurance') ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
                }}
              >
                <span>Insurance</span>
                <IonIcon
                  icon={chevronDownOutline}
                  style={{
                    fontSize: '0.8rem',
                    transform: activeDropdown === 'insurance' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {activeDropdown === 'insurance' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e2e8f0',
                    minWidth: '200px',
                    padding: '8px',
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={() => navTo('/car-insurance')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: location.pathname === '/car-insurance' ? '#f0f7ff' : 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🚗</span>
                    <span>Car Insurance</span>
                  </button>

                  <button
                    onClick={() => navTo('/check-insurance')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: location.pathname === '/check-insurance' ? '#f0f7ff' : 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: location.pathname === '/check-insurance' ? '#2563eb' : '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🛡️</span>
                    <span>Check Insurance Status</span>
                  </button>


                  <button
                    onClick={() => navTo('/bike-insurance')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: location.pathname === '/bike-insurance' ? '#f0f7ff' : 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🛵</span>
                    <span>Bike Insurance</span>
                  </button>

                  <button
                    onClick={() => navTo('/insurance')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#2563eb',
                      cursor: 'pointer',
                      borderTop: '1px solid #f1f5f9',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>⚡ Compare All Quotes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Insurance Claim (Separate Nav Bar Heading) */}
            <button
              onClick={() => navTo('/claim-insurance')}
              style={{
                background: location.pathname === '/claim-insurance' ? '#2563eb' : 'transparent',
                border: 'none',
                color: location.pathname === '/claim-insurance' ? '#ffffff' : '#334155',
                fontSize: '0.92rem',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: location.pathname === '/claim-insurance' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Insurance Claim</span>
            </button>

            {/* Vehicleinfo Active Blue Pill Dropdown */}
            <div className="header-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'vehicleinfo' ? null : 'vehicleinfo');
                }}
                style={{
                  background: (location.pathname === '/rc-search' || location.pathname === '/garage') ? '#2563eb' : 'transparent',
                  border: 'none',
                  color: (location.pathname === '/rc-search' || location.pathname === '/garage') ? '#ffffff' : '#334155',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                  boxShadow: (location.pathname === '/rc-search' || location.pathname === '/garage') ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
                }}
              >
                <span>Vehicleinfo</span>
                <IonIcon
                  icon={chevronDownOutline}
                  style={{
                    fontSize: '0.8rem',
                    transform: activeDropdown === 'vehicleinfo' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {activeDropdown === 'vehicleinfo' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e2e8f0',
                    minWidth: '220px',
                    padding: '8px',
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={() => navTo('/rc-search')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🔍</span>
                    <span>RC Search Details</span>
                  </button>

                  <button
                    onClick={() => navTo('/home')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🚨</span>
                    <span>Check Challan Online</span>
                  </button>

                  <button
                    onClick={() => navTo('/garage')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🏠</span>
                    <span>My Garage & Vault</span>
                  </button>
                </div>
              )}
            </div>

            {/* Service Dropdown */}
            <div className="header-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'service' ? null : 'service');
                }}
                style={{
                  background: (location.pathname.includes('service') || location.pathname.includes('exam')) ? '#2563eb' : 'transparent',
                  border: 'none',
                  color: (location.pathname.includes('service') || location.pathname.includes('exam')) ? '#ffffff' : '#334155',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  boxShadow: (location.pathname.includes('service') || location.pathname.includes('exam')) ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
                }}
              >
                <span>Service</span>
                <IonIcon
                  icon={chevronDownOutline}
                  style={{
                    fontSize: '0.8rem',
                    transform: activeDropdown === 'service' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {activeDropdown === 'service' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e2e8f0',
                    minWidth: '220px',
                    padding: '8px',
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={() => navTo('/services')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>📝</span>
                    <span>RTO Mock Exam & Test</span>
                  </button>

                  <button
                    onClick={() => navTo('/services')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>💳</span>
                    <span>FASTag Recharge</span>
                  </button>

                  <button
                    onClick={() => navTo('/services')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🪪</span>
                    <span>Driving Licence Info</span>
                  </button>
                </div>
              )}
            </div>

            {/* Blogs */}
            <button
              onClick={() => navTo('/services')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.92rem',
                fontWeight: 700,
                padding: '7px 18px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Blogs
            </button>
          </nav>

          {/* Right Controls: City Selector & Login Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Location Selector Pill */}
            <button
              onClick={() => setShowCityPicker(true)}
              title={isLiveLocation ? `Live Location: ${selectedCity}` : `City: ${selectedCity} (Click to set live location)`}
              style={{
                background: isLiveLocation ? '#f0fdf4' : '#f8fafc',
                border: `1.5px solid ${isLiveLocation ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '24px',
                color: isLiveLocation ? '#15803d' : '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '7px 14px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isLiveLocation ? '0 2px 10px rgba(34, 197, 94, 0.16)' : 'none',
              }}
            >
              <span style={{ color: isLiveLocation ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center' }}>
                {isLocating ? (
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                ) : isLiveLocation ? (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.3)' }} />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                )}
              </span>
              <span>{isLocating ? 'Detecting...' : selectedCity}</span>
              {isLiveLocation && !isLocating && (
                <span style={{ fontSize: '0.64rem', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.3px' }}>
                  LIVE
                </span>
              )}
            </button>

            {/* Login Dark Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '7px 22px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)',
                transition: 'background 0.15s ease',
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* City / Live Location Picker Modal */}
      {showCityPicker && (
        <div className="bottom-sheet-overlay" onClick={() => setShowCityPicker(false)}>
          <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="sheet-drag-pill" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                  Select Location / RTO Hub
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Regional jurisdiction for accurate RTO fees & state guidelines
                </p>
              </div>
              <button
                onClick={() => setShowCityPicker(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Live GPS Detection Banner */}
            <div
              onClick={() => {
                detectLiveLocation();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '14px',
                background: isLiveLocation ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: `1.5px solid ${isLiveLocation ? '#86efac' : '#93c5fd'}`,
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '1.3rem' }}>{isLocating ? '⏳' : isLiveLocation ? '📍' : '📡'}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.94rem', color: isLiveLocation ? '#166534' : '#1e40af' }}>
                    {isLocating ? 'Detecting Live Coordinates...' : isLiveLocation ? `Live Location Active: ${selectedCity}` : 'Use Current Live Location (GPS)'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: isLiveLocation ? '#15803d' : '#3b82f6' }}>
                    {isLocating ? 'Acquiring GPS fix & reverse geocoding...' : 'Auto-detect your current city via satellite & network'}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: isLiveLocation ? '#16a34a' : '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {isLocating ? 'Locating...' : isLiveLocation ? 'Active 🟢' : 'Detect GPS'}
              </span>
            </div>

            {locationError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span>
                <span>{locationError}</span>
              </div>
            )}

            {/* City Search Bar */}
            <div style={{ marginBottom: '14px' }}>
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Search your city (e.g. Chennai, Madurai, Mumbai...)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            {/* Custom City Apply if typed */}
            {citySearchQuery.trim() && !cities.some(c => c.toLowerCase() === citySearchQuery.trim().toLowerCase()) && (
              <button
                onClick={() => handleSelectCity(citySearchQuery.trim())}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  border: '1.5px dashed #3b82f6',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  textAlign: 'left',
                }}
              >
                📍 Set location to "<strong>{citySearchQuery.trim()}</strong>"
              </button>
            )}

            {/* Cities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {cities
                .filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))
                .map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `1.5px solid ${selectedCity.toLowerCase() === city.toLowerCase() ? '#2563eb' : '#e2e8f0'}`,
                      background: selectedCity.toLowerCase() === city.toLowerCase() ? '#eff6ff' : '#f8fafc',
                      color: selectedCity.toLowerCase() === city.toLowerCase() ? '#1d4ed8' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>📍 {city}</span>
                    {selectedCity.toLowerCase() === city.toLowerCase() && (
                      <span style={{ color: '#2563eb', fontWeight: 800 }}>✓</span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="bottom-sheet-overlay" onClick={() => setShowLoginModal(false)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '420px',
              width: '90%',
              margin: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Login to Vehicle Info
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Access saved vehicles, challans, and insurance policies
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <span style={{ padding: '10px 12px', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.9rem', borderRight: '1px solid #cbd5e1' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    defaultValue="9820099887"
                    style={{ flex: 1, border: 'none', padding: '10px 12px', outline: 'none', fontSize: '0.92rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  alert('Logged in successfully!');
                  setShowLoginModal(false);
                }}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                Send OTP & Login
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
                By logging in, you agree to our Terms of Service & Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
