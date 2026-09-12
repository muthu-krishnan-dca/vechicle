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
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const cities = ['New delhi', 'Mumbai', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kochi', 'Coimbatore', 'Tirunelveli', 'Pune', 'Ahmedabad'];

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
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
          background: '#ffffff',
          borderBottom: '1px solid #eef2f6',
          padding: '10px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
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

          {/* Desktop Navigation Links matching Screenshot */}
          <nav
            className="desktop-header-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {/* Home */}
            <button
              onClick={() => navTo('/home')}
              style={{
                background: 'transparent',
                border: 'none',
                color: location.pathname === '/home' ? '#2563eb' : '#334155',
                fontSize: '0.92rem',
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                  background: location.pathname.includes('insurance') ? '#eff6ff' : 'transparent',
                  border: 'none',
                  color: location.pathname.includes('insurance') ? '#2563eb' : '#334155',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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

            {/* Vehicleinfo Active Blue Pill Dropdown */}
            <div className="header-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'vehicleinfo' ? null : 'vehicleinfo');
                }}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  padding: '7px 18px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
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
                  background: 'transparent',
                  border: 'none',
                  color: '#334155',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              Blogs
            </button>
          </nav>

          {/* Right Controls: City Selector & Login Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Location Selector */}
            <button
              onClick={() => setShowCityPicker(true)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                color: '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '7px 14px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
              <span>{selectedCity}</span>
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

      {/* City Picker Modal */}
      {showCityPicker && (
        <div className="bottom-sheet-overlay" onClick={() => setShowCityPicker(false)}>
          <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-pill" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Select Your City / RTO Hub
              </h3>
              <button
                onClick={() => setShowCityPicker(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${selectedCity === city ? '#2563eb' : '#e2e8f0'}`,
                    background: selectedCity === city ? '#eff6ff' : '#f8fafc',
                    color: selectedCity === city ? '#1d4ed8' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  📍 {city}
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
