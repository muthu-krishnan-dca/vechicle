import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonSpinner, IonBadge } from '@ionic/react';
import {
  closeOutline,
  receiptOutline,
  checkmarkCircle,
  alertCircleOutline,
  shieldCheckmarkOutline,
  searchOutline,
  carSportOutline,
  locationOutline,
  calendarOutline,
  refreshOutline,
  globeOutline,
  cloudDownloadOutline,
  sparklesOutline,
  informationCircleOutline,
} from 'ionicons/icons';
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
  const [searchInput, setSearchInput] = useState(regNo);
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  // Free Parivahan eChallan Scraper States
  const [showGovtScraper, setShowGovtScraper] = useState(false);
  const [captchaSessionId, setCaptchaSessionId] = useState<string | null>(null);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [scraperSubmitting, setScraperSubmitting] = useState(false);
  const [scraperMessage, setScraperMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchChallans = async (plate: string) => {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    if (!cleanPlate) return;
    setLoading(true);
    try {
      const data = await api.getChallans(cleanPlate);
      setChallans(data);
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFreshCaptcha = async (sessionId?: string) => {
    setCaptchaLoading(true);
    setScraperMessage(null);
    try {
      const res = await api.getEchallanCaptcha(sessionId);
      if (res.success) {
        setCaptchaSessionId(res.session_id);
        setCaptchaImage(res.captcha_image);
        setCaptchaInput('');
      } else {
        setScraperMessage({ type: 'error', text: res.error || 'Failed to connect to Parivahan portal.' });
      }
    } catch (err) {
      setScraperMessage({ type: 'error', text: 'Error contacting scraper service.' });
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleToggleGovtScraper = () => {
    if (!showGovtScraper) {
      setShowGovtScraper(true);
      loadFreshCaptcha();
    } else {
      setShowGovtScraper(false);
      setScraperMessage(null);
    }
  };

  const handleScraperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaSessionId || !captchaInput.trim()) return;

    setScraperSubmitting(true);
    setScraperMessage(null);
    try {
      const cleanPlate = currentReg.replace(/\s+/g, '').toUpperCase();
      const res = await api.searchEchallanScraper({
        session_id: captchaSessionId,
        vehicle_no: cleanPlate,
        captcha_text: captchaInput.trim(),
      });

      if (res.success) {
        if (res.status === 'CLEAN' || res.total_challans === 0) {
          setScraperMessage({
            type: 'info',
            text: `100% Clean Record! No active or disposed challans found for ${cleanPlate} in Parivahan database.`,
          });
        } else {
          setScraperMessage({
            type: 'success',
            text: `Success! Retrieved & saved ${res.total_challans} live Parivahan challan(s) into database.`,
          });
        }
        // Refresh challans from database
        await fetchChallans(cleanPlate);
        setTimeout(() => {
          setShowGovtScraper(false);
        }, 3000);
      } else {
        setScraperMessage({ type: 'error', text: res.message || 'Verification failed.' });
        if (res.new_captcha) {
          setCaptchaImage(res.new_captcha);
          setCaptchaInput('');
        } else {
          loadFreshCaptcha(captchaSessionId);
        }
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.error === 'INVALID_CAPTCHA') {
        setScraperMessage({ type: 'error', text: 'Incorrect CAPTCHA entered. Please try again with the new image.' });
        if (errData.new_captcha) {
          setCaptchaImage(errData.new_captcha);
        } else {
          loadFreshCaptcha(captchaSessionId || undefined);
        }
        setCaptchaInput('');
      } else {
        setScraperMessage({
          type: 'error',
          text: errData?.message || 'Failed to query Parivahan e-Challan portal. Please retry.',
        });
      }
    } finally {
      setScraperSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const clean = (regNo || 'MH01AE8055').replace(/\s+/g, '').toUpperCase();
      setCurrentReg(clean);
      setSearchInput(clean);
      fetchChallans(clean);
    }
  }, [isOpen, regNo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().replace(/\s+/g, '').toUpperCase();
    if (clean) {
      setCurrentReg(clean);
      fetchChallans(clean);
    }
  };

  const handleQuickSelect = (plate: string) => {
    setSearchInput(plate);
    setCurrentReg(plate);
    fetchChallans(plate);
  };

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
  const paidList = challans.filter((c) => c.status === 'PAID');
  const totalPending = pendingList.reduce((sum, c) => sum + Number(c.fine_amount), 0);
  const totalPaid = paidList.reduce((sum, c) => sum + Number(c.fine_amount), 0);

  const displayedChallans =
    activeFilter === 'PENDING'
      ? pendingList
      : activeFilter === 'PAID'
      ? paidList
      : challans;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="sheet-drag-pill" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={receiptOutline} style={{ color: '#2563eb', fontSize: '1.25rem' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Outfit' }}>
                  Vehicle e-Challans
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Masters India & Parivahan Vahan e-Challan System
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem', color: '#64748b' }} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchInput}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="Enter Vehicle Number (e.g. AB03Y8711)"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                outline: 'none',
                fontFamily: 'monospace',
                background: '#f8fafc',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 18px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? <IonSpinner name="dots" style={{ color: '#fff', width: '20px' }} /> : <><IonIcon icon={searchOutline} /> Check</>}
          </button>
        </form>

        {/* Quick Sample Vehicle Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center', whiteSpace: 'nowrap' }}>Sample:</span>
          {[
            { plate: 'AB03Y8711', label: 'AB03Y8711 (Masters India API)' },
            { plate: 'MH01AE8055', label: 'MH01AE8055 (Hunter 350)' },
            { plate: 'TN92L1078', label: 'TN92L1078' },
            { plate: 'PB03Y8611', label: 'PB03Y8611 (Tata Truck)' },
          ].map((chip) => (
            <button
              key={chip.plate}
              onClick={() => handleQuickSelect(chip.plate)}
              style={{
                background: currentReg === chip.plate ? '#eff6ff' : '#f1f5f9',
                color: currentReg === chip.plate ? '#2563eb' : '#475569',
                border: `1px solid ${currentReg === chip.plate ? '#93c5fd' : '#e2e8f0'}`,
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Parivahan Live Govt Portal Scraper Sync Trigger */}
        <div style={{ marginBottom: '14px' }}>
          <div
            onClick={handleToggleGovtScraper}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              border: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={globeOutline} style={{ color: '#fff', fontSize: '1rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Parivahan Live Govt Sync
                  <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    100% FREE
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Direct search on echallan.parivahan.gov.in • No commercial API key
                </div>
              </div>
            </div>
            <button
              type="button"
              style={{
                background: showGovtScraper ? '#334155' : '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {showGovtScraper ? 'Close' : 'Live Sync'}
            </button>
          </div>

          {/* Interactive CAPTCHA Scraper Form */}
          {showGovtScraper && (
            <div
              style={{
                marginTop: '10px',
                padding: '14px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#2563eb' }} />
                  Govt Parivahan CAPTCHA Verification for <strong style={{ color: '#2563eb' }}>{currentReg}</strong>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Ministry of Road Transport</span>
              </div>

              {scraperMessage && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: scraperMessage.type === 'success' ? '#dcfce7' : scraperMessage.type === 'error' ? '#fee2e2' : '#eff6ff',
                    color: scraperMessage.type === 'success' ? '#15803d' : scraperMessage.type === 'error' ? '#b91c1c' : '#1d4ed8',
                    border: `1px solid ${scraperMessage.type === 'success' ? '#86efac' : scraperMessage.type === 'error' ? '#fca5a5' : '#bfdbfe'}`,
                  }}
                >
                  {scraperMessage.text}
                </div>
              )}

              <form onSubmit={handleScraperSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Captcha Image Container */}
                  <div
                    style={{
                      height: '42px',
                      background: '#000000',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '130px',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  >
                    {captchaLoading ? (
                      <IonSpinner name="dots" style={{ color: '#ffffff', width: '24px' }} />
                    ) : captchaImage ? (
                      <img
                        src={captchaImage}
                        alt="Parivahan Captcha"
                        style={{ maxHeight: '36px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Loading...</span>
                    )}
                  </div>

                  {/* Refresh Captcha Button */}
                  <button
                    type="button"
                    onClick={() => loadFreshCaptcha(captchaSessionId || undefined)}
                    disabled={captchaLoading}
                    title="Refresh CAPTCHA image"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    <IonIcon icon={refreshOutline} style={{ fontSize: '1.1rem' }} />
                  </button>

                  {/* Captcha Input */}
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.trim())}
                    placeholder="Enter code"
                    maxLength={7}
                    required
                    style={{
                      flex: 1,
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #94a3b8',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Type the characters shown in image. Free live sync.
                  </span>
                  <button
                    type="submit"
                    disabled={scraperSubmitting || captchaLoading || !captchaInput.trim()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {scraperSubmitting ? (
                      <>
                        <IonSpinner name="dots" style={{ color: '#fff', width: '20px' }} />
                        <span>Querying Parivahan...</span>
                      </>
                    ) : (
                      <>
                        <IonIcon icon={cloudDownloadOutline} />
                        <span>Verify & Fetch</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Current Vehicle Badge & Summary Cards */}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          {/* Pending Fines Card */}
          <div
            onClick={() => setActiveFilter('PENDING')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: totalPending > 0 ? '#fef2f2' : '#f0fdf4',
              border: `1.5px solid ${activeFilter === 'PENDING' ? '#dc2626' : totalPending > 0 ? '#fecaca' : '#bbf7d0'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: totalPending > 0 ? '#991b1b' : '#166534', fontWeight: 700 }}>
                Pending Fines
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: totalPending > 0 ? '#fee2e2' : '#dcfce7', color: totalPending > 0 ? '#b91c1c' : '#15803d', fontWeight: 700 }}>
                {pendingList.length} Active
              </span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: totalPending > 0 ? '#dc2626' : '#16a34a', fontFamily: 'Outfit', marginTop: '4px' }}>
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Disposed / Settled Card */}
          <div
            onClick={() => setActiveFilter('PAID')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: `1.5px solid ${activeFilter === 'PAID' ? '#2563eb' : '#e2e8f0'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
                Disposed (Paid)
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#e2e8f0', color: '#334155', fontWeight: 700 }}>
                {paidList.length} Settled
              </span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit', marginTop: '4px' }}>
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Filter Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          {[
            { id: 'ALL', label: `All Challans (${challans.length})` },
            { id: 'PENDING', label: `Pending (${pendingList.length})` },
            { id: 'PAID', label: `Disposed (${paidList.length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              style={{
                background: activeFilter === f.id ? '#1e293b' : 'transparent',
                color: activeFilter === f.id ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Challans List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <IonSpinner name="crescent" style={{ color: '#2563eb' }} />
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
              Querying e-Challan database for {currentReg}...
            </div>
          </div>
        ) : displayedChallans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#16a34a', fontSize: '1.6rem' }} />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
              No Traffic Challans Found
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Vehicle <strong>{currentReg}</strong> has a 100% clean driving record with zero pending or disposed fines recorded under this filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {displayedChallans.map((c) => {
              const isPaid = c.status === 'PAID';
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isPaid ? '#bbf7d0' : '#fecaca'}`,
                    background: isPaid ? '#f0fdf4' : '#fff5f5',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>
                          #{c.challan_number}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                          {c.vehicle_reg_no}
                        </span>
                      </div>
                      <h4 style={{ margin: '2px 0', fontSize: '0.94rem', fontWeight: 800, color: '#1e293b' }}>
                        {c.violation_title}
                      </h4>
                    </div>

                    <IonBadge
                      style={{
                        '--background': isPaid ? '#dcfce7' : '#fee2e2',
                        '--color': isPaid ? '#16a34a' : '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {isPaid ? 'DISPOSED' : 'PENDING'}
                    </IonBadge>
                  </div>

                  {c.violation_description && (
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '8px', lineHeight: 1.4, background: 'rgba(255,255,255,0.6)', padding: '6px 8px', borderRadius: '6px' }}>
                      {c.violation_description}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.74rem', color: '#64748b', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <IonIcon icon={locationOutline} style={{ color: '#2563eb' }} />
                      {c.offense_place || 'Traffic Jurisdiction'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <IonIcon icon={calendarOutline} style={{ color: '#64748b' }} />
                      {new Date(c.offense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Fine Imposed</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isPaid ? '#16a34a' : '#dc2626', fontFamily: 'Outfit' }}>
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
                          fontSize: '0.8rem',
                          height: '36px',
                        }}
                      >
                        {payingId === c.id ? <IonSpinner name="dots" /> : 'Pay Fine Online'}
                      </IonButton>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <IonIcon icon={checkmarkCircle} /> Settled & Disposed
                        </span>
                        {c.payment_reference && (
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                            Receipt: {c.payment_reference}
                          </span>
                        )}
                      </div>
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
