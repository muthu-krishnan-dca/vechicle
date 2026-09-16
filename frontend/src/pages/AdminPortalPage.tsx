import React, { useState, useEffect, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
} from '@ionic/react';
import {
  api,
  AdminStatsResponse,
  VehicleRecord,
  ChallanRecord,
  PolicyRecord,
  ClaimRecord,
} from '../services/api';
import { ALL_INDIA_RTO_OFFICES, RtoOfficeItem } from '../data/rtoOfficesData';
import { BrandLogo } from '../components/BrandLogo';

type AdminTab = 'overview' | 'vehicles' | 'challans' | 'policies' | 'claims' | 'rto' | 'system';

export const AdminPortalPage: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vinfo_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Live Data State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);

  // Search & Filter queries
  const [searchQuery, setSearchQuery] = useState('');
  const [challanFilter, setChallanFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [claimFilter, setClaimFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SETTLED' | 'REJECTED'>('ALL');

  // Selected Item Modal
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const getIsoDateString = (daysOffset: number = 0) => {
    const d = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  // New vehicle form state
  const initialVehForm = {
    registration_number: '',
    owner_name: '',
    maker_model: '',
    vehicle_class: 'M-Cycle/Scooter(2WN)',
    fuel_type: 'PETROL',
    engine_capacity_cc: 125,
    registration_date: getIsoDateString(-365),
    insurance_upto: getIsoDateString(180),
    fitness_upto: getIsoDateString(365 * 14),
    pucc_upto: getIsoDateString(90),
    rto_office: '',
    status: 'ACTIVE',
  };

  const [newVehForm, setNewVehForm] = useState(initialVehForm);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [createVehError, setCreateVehError] = useState<string | null>(null);

  // Load Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, vehRes, chalRes, polRes, claimRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAllVehicles(),
        api.getChallans(),
        api.getVaultPolicies(),
        api.getClaims(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (vehRes.status === 'fulfilled') setVehicles(vehRes.value);
      if (chalRes.status === 'fulfilled') setChallans(chalRes.value);
      if (polRes.status === 'fulfilled') setPolicies(polRes.value);
      if (claimRes.status === 'fulfilled') setClaims(claimRes.value);
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'vehicleinfo') {
      setIsAuthenticated(true);
      sessionStorage.setItem('vinfo_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Invalid Admin Password. Please enter the correct password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('vinfo_admin_auth');
    localStorage.removeItem('vinfo_admin_auth');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  // Actions
  const handlePayChallan = async (challanId: number) => {
    try {
      await api.payChallan(challanId);
      setActionSuccessMsg(`Challan #${challanId} settled successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      loadAdminData();
    } catch (err) {
      alert('Failed to settle challan');
    }
  };

  const handleDeleteVehicle = async (regNo: string) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${regNo}?`)) return;
    try {
      await api.deleteVehicle(regNo);
      setActionSuccessMsg(`Vehicle ${regNo} deleted from registry.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      loadAdminData();
    } catch (err) {
      alert('Failed to delete vehicle');
    }
  };

  const handleUpdateClaimStatus = async (claimNumber: string, status: 'APPROVED' | 'SETTLED' | 'REJECTED') => {
    try {
      await api.updateClaimStatus(claimNumber, {
        status,
        surveyor_notes: `Status updated to ${status} by Admin on ${new Date().toLocaleString()}`,
      });
      setActionSuccessMsg(`Claim #${claimNumber} marked as ${status}!`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      if (selectedClaim && selectedClaim.claim_number === claimNumber) {
        setSelectedClaim(prev => prev ? { ...prev, status } : null);
      }
      loadAdminData();
    } catch (err) {
      alert('Failed to update claim status');
    }
  };

  const handleRegNoChange = (val: string) => {
    const upper = val.toUpperCase().replace(/\s+/g, '');
    let matchedRto = newVehForm.rto_office;
    if (upper.length >= 4) {
      const code = upper.slice(0, 4);
      const match = ALL_INDIA_RTO_OFFICES.find(r => r.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === code);
      if (match) {
        matchedRto = `${match.name}, ${match.state}`;
      }
    }
    setNewVehForm(prev => ({
      ...prev,
      registration_number: upper,
      rto_office: matchedRto,
    }));
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = newVehForm.registration_number.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!cleanPlate || cleanPlate.length < 4) {
      setCreateVehError('Please enter a valid Registration Number Plate (e.g. TN92AB1234 or TN69AA1111)');
      return;
    }
    if (!newVehForm.owner_name.trim()) {
      setCreateVehError('Owner Name is required');
      return;
    }
    setSubmittingVehicle(true);
    setCreateVehError(null);
    try {
      await api.saveVehicle({
        ...newVehForm,
        registration_number: cleanPlate,
        owner_name: newVehForm.owner_name.trim().toUpperCase(),
      });
      setShowAddVehicleModal(false);
      setActionSuccessMsg(`Vehicle ${cleanPlate} registered successfully in database!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setNewVehForm({
        ...initialVehForm,
        registration_date: getIsoDateString(-365),
        insurance_upto: getIsoDateString(180),
        fitness_upto: getIsoDateString(365 * 14),
        pucc_upto: getIsoDateString(90),
      });
      await loadAdminData();
    } catch (err: any) {
      console.error('Failed to register vehicle:', err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to register vehicle in database';
      setCreateVehError(errMsg);
    } finally {
      setSubmittingVehicle(false);
    }
  };

  // Filtered collections
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const q = searchQuery.toLowerCase();
    return vehicles.filter(v =>
      v.registration_number.toLowerCase().includes(q) ||
      v.owner_name.toLowerCase().includes(q) ||
      v.maker_model.toLowerCase().includes(q) ||
      v.rto_office.toLowerCase().includes(q)
    );
  }, [vehicles, searchQuery]);

  const filteredChallans = useMemo(() => {
    return challans.filter(c => {
      const matchesStatus = challanFilter === 'ALL' ? true : c.status === challanFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        c.challan_number.toLowerCase().includes(q) ||
        c.vehicle_reg_no.toLowerCase().includes(q) ||
        c.violation_title.toLowerCase().includes(q) ||
        c.offense_place.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [challans, challanFilter, searchQuery]);

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies;
    const q = searchQuery.toLowerCase();
    return policies.filter(p =>
      p.policy_number.toLowerCase().includes(q) ||
      p.vehicle_reg_no.toLowerCase().includes(q) ||
      p.owner_name.toLowerCase().includes(q) ||
      p.insurer_name.toLowerCase().includes(q)
    );
  }, [policies, searchQuery]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesStatus = claimFilter === 'ALL' ? true : c.status === claimFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        c.claim_number.toLowerCase().includes(q) ||
        c.vehicle_reg_no.toLowerCase().includes(q) ||
        c.driver_name.toLowerCase().includes(q) ||
        c.accident_place.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [claims, claimFilter, searchQuery]);

  const filteredRTOs = useMemo(() => {
    if (!searchQuery.trim()) return ALL_INDIA_RTO_OFFICES;
    const q = searchQuery.toLowerCase();
    return ALL_INDIA_RTO_OFFICES.filter((r: RtoOfficeItem) =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Auth Gate UI
  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonContent fullscreen className="admin-login-screen">
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff1f5 0%, #fdf2f8 50%, #ffe4e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#1e293b',
          }}>
            <div style={{
              maxWidth: '440px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '28px',
              padding: '40px 32px',
              border: '1px solid #fbcfe8',
              boxShadow: '0 25px 60px -15px rgba(236, 72, 153, 0.18), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BrandLogo size={64} showText={false} />
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#be185d',
                background: '#fce7f3',
                padding: '4px 14px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                border: '1px solid #fbcfe8',
              }}>
                VehicleInfo Control Room
              </span>

              <h1 style={{
                fontSize: '26px',
                fontWeight: 800,
                margin: '16px 0 6px',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}>
                Admin Portal Gate
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
                Restricted operations panel for managing vehicles, live traffic challans, policies & insurance claims.
              </p>

              {pinError && (
                <div style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginBottom: '18px',
                  textAlign: 'left',
                  fontWeight: 500,
                }}>
                  ⚠️ {pinError}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Admin Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      background: '#fff8fa',
                      border: '1.5px solid #fbcfe8',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  Unlock Admin Portal &rarr;
                </button>
              </form>

              <div style={{ marginTop: '24px', borderTop: '1px solid #fce7f3', paddingTop: '16px' }}>
                <a
                  href="/rc-search"
                  style={{
                    color: '#db2777',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  &larr; Return to Public Vehicle App
                </a>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="admin-portal-content">
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #fff5f8 0%, #fdf2f8 35%, #ffffff 100%)',
          fontFamily: "'Inter', -apple-system, sans-serif",
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Top Admin Navigation Bar */}
          <header style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderBottom: '1px solid #fce7f3',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px -4px rgba(244, 114, 182, 0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <BrandLogo size={38} showText={false} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    VehicleInfo Admin
                  </h2>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#db2777',
                    background: '#fdf2f8',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #fbcfe8',
                  }}>
                    ● LIVE PORTAL
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#9d174d' }}>
                  Unified Operations & Master Control Center
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh Live Data"
                style={{
                  background: '#ffffff',
                  border: '1px solid #fce7f3',
                  color: '#be185d',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(244, 114, 182, 0.08)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                {refreshing ? 'Syncing...' : 'Sync'}
              </button>

              {/* Add Vehicle Action */}
              <button
                onClick={() => setShowAddVehicleModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                }}
              >
                + Register Vehicle
              </button>

              {/* Lock Admin */}
              <button
                onClick={handleLogout}
                title="Lock Admin Screen"
                style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                🔒 Lock
              </button>

              {/* Leave Admin */}
              <button
                onClick={() => {
                  handleLogout();
                  window.location.href = '/';
                }}
                title="Logout & Leave Admin Portal"
                style={{
                  background: '#ffffff',
                  border: '1px solid #fce7f3',
                  color: '#db2777',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(244, 114, 182, 0.08)',
                }}
              >
                🚪 Leave
              </button>
            </div>
          </header>

          {/* Toast Notification Banner */}
          {actionSuccessMsg && (
            <div style={{
              background: 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)',
              color: '#ffffff',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            }}>
              <span>✅ {actionSuccessMsg}</span>
              <button
                onClick={() => setActionSuccessMsg(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Main Dashboard Layout */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Left Sidebar */}
            <aside style={{
              width: '260px',
              background: '#ffffff',
              borderRight: '1px solid #fce7f3',
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0,
              boxShadow: '4px 0 20px -4px rgba(244, 114, 182, 0.06)',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9d174d',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '6px 12px',
                marginBottom: '4px',
              }}>
                Operations
              </div>

              {[
                { id: 'overview', label: 'Dashboard Overview', icon: '📊', count: null },
                { id: 'vehicles', label: 'Vehicles Registry', icon: '🚗', count: stats?.vehicles.total ?? vehicles.length },
                { id: 'challans', label: 'Traffic Challans', icon: '🚨', count: stats?.challans.pending ?? challans.filter(c => c.status === 'PENDING').length },
                { id: 'policies', label: 'Insurance Vault', icon: '🛡️', count: stats?.policies.total ?? policies.length },
                { id: 'claims', label: 'Claims Surveyor Desk', icon: '📑', count: stats?.claims.pending ?? claims.filter(c => c.status === 'PENDING').length },
                { id: 'rto', label: 'RTO Master Data', icon: '🏛️', count: ALL_INDIA_RTO_OFFICES.length },
                { id: 'system', label: 'System & APIs', icon: '⚙️', count: null },
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdminTab);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      background: isActive ? 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' : 'transparent',
                      border: isActive ? '1px solid #f472b6' : '1px solid transparent',
                      color: isActive ? '#be185d' : '#64748b',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(244, 114, 182, 0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '100px',
                        background: isActive ? '#ec4899' : '#fce7f3',
                        color: isActive ? '#ffffff' : '#9d174d',
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #fce7f3' }}>
                <div style={{
                  background: '#fff8fa',
                  borderRadius: '14px',
                  padding: '12px',
                  border: '1px solid #fce7f3',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#be185d', marginBottom: '4px' }}>
                    Database Connectivity
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    MySQL (vehicleinfo_db)
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                    Django REST Engine v5.0.6
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
              flex: 1,
              padding: '24px 30px',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #fff5f8 0%, #fdf2f8 35%, #ffffff 100%)',
            }}>
              {loading && !refreshing && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <IonSpinner name="crescent" style={{ transform: 'scale(1.4)' }} />
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '14px' }}>
                    Loading centralized operations data...
                  </p>
                </div>
              )}

              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                      Operations Dashboard
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Live metrics across registered vehicles, pending challan fines, active policies, and claim settlements.
                    </p>
                  </div>

                  {/* 4 Primary KPI Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                    marginBottom: '28px',
                  }}>
                    {/* Vehicles Card */}
                    <div
                      onClick={() => setActiveTab('vehicles')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fce7f3',
                        borderRadius: '20px',
                        padding: '22px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        boxShadow: '0 8px 25px -4px rgba(244, 114, 182, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Registered Vehicles
                        </span>
                        <span style={{ fontSize: '22px' }}>🚗</span>
                      </div>
                      <div style={{ fontSize: '34px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                        {stats?.vehicles.total ?? vehicles.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#db2777', fontWeight: 600 }}>
                        &rarr; View & manage vehicle RC cards
                      </div>
                    </div>

                    {/* Challans Card */}
                    <div
                      onClick={() => setActiveTab('challans')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #ffe4e6',
                        borderRadius: '20px',
                        padding: '22px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px -4px rgba(244, 63, 94, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Pending Challans
                        </span>
                        <span style={{ fontSize: '22px' }}>🚨</span>
                      </div>
                      <div style={{ fontSize: '34px', fontWeight: 800, color: '#e11d48', marginBottom: '6px' }}>
                        {stats?.challans.pending ?? challans.filter(c => c.status === 'PENDING').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Total Fines: <strong style={{ color: '#e11d48' }}>₹{(stats?.challans.fines_pending || 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Policies Card */}
                    <div
                      onClick={() => setActiveTab('policies')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fce7f3',
                        borderRadius: '20px',
                        padding: '22px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px -4px rgba(236, 72, 153, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Issued Policies
                        </span>
                        <span style={{ fontSize: '22px' }}>🛡️</span>
                      </div>
                      <div style={{ fontSize: '34px', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                        {stats?.policies.total ?? policies.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Premium Volume: <strong style={{ color: '#059669' }}>₹{(stats?.policies.total_premium || 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Claims Card */}
                    <div
                      onClick={() => setActiveTab('claims')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fef3c7',
                        borderRadius: '20px',
                        padding: '22px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px -4px rgba(245, 158, 11, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Claims Pending Review
                        </span>
                        <span style={{ fontSize: '22px' }}>📑</span>
                      </div>
                      <div style={{ fontSize: '34px', fontWeight: 800, color: '#d97706', marginBottom: '6px' }}>
                        {stats?.claims.pending ?? claims.filter(c => c.status === 'PENDING').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Approved / Settled: <strong style={{ color: '#059669' }}>{stats?.claims.approved ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Section: Recent Vehicles + Pending Challans */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                    {/* Recent Vehicles */}
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #fce7f3',
                      padding: '22px',
                      boxShadow: '0 10px 25px -5px rgba(244, 114, 182, 0.1)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          Recent Vehicles in Registry
                        </h3>
                        <button
                          onClick={() => setActiveTab('vehicles')}
                          style={{ background: 'none', border: 'none', color: '#db2777', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          View All ({vehicles.length}) &rarr;
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {vehicles.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#64748b', fontSize: '13px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚗</div>
                            <div style={{ color: '#64748b', marginBottom: '12px' }}>No vehicles registered in database yet.</div>
                            <button
                              onClick={() => setShowAddVehicleModal(true)}
                              style={{
                                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '9px 18px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)',
                              }}
                            >
                              + Register First Vehicle
                            </button>
                          </div>
                        ) : (
                          vehicles.slice(0, 5).map(v => (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVehicle(v)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: '#fff8fa',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                border: '1px solid #fce7f3',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    background: '#fdf2f8',
                                    border: '1px solid #f472b6',
                                    color: '#be185d',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    letterSpacing: '0.05em',
                                  }}>
                                    {v.registration_number}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                                    {v.maker_model}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                  Owner: {v.owner_name} &bull; {v.rto_office.split(',')[0]}
                                </div>
                              </div>

                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: v.insurance_status === 'ACTIVE' ? '#ecfdf5' : '#fff1f2',
                                color: v.insurance_status === 'ACTIVE' ? '#059669' : '#e11d48',
                                border: v.insurance_status === 'ACTIVE' ? '1px solid #a7f3d0' : '1px solid #fecdd3',
                              }}>
                                {v.insurance_status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Pending Challans Table */}
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #fce7f3',
                      padding: '22px',
                      boxShadow: '0 10px 25px -5px rgba(244, 114, 182, 0.1)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          Active Challan Violations
                        </h3>
                        <button
                          onClick={() => setActiveTab('challans')}
                          style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          View All ({challans.length}) &rarr;
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {challans.filter(c => c.status === 'PENDING').length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#64748b', fontSize: '13px' }}>
                            ✅ No pending traffic challans found.
                          </div>
                        ) : (
                          challans.filter(c => c.status === 'PENDING').slice(0, 5).map(c => (
                            <div
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: '#fff8fa',
                                borderRadius: '12px',
                                border: '1px solid #ffe4e6',
                              }}
                            >
                              <div style={{ maxWidth: '65%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#e11d48' }}>
                                    {c.vehicle_reg_no}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                    #{c.challan_number}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {c.violation_title}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#e11d48' }}>
                                  ₹{parseFloat(String(c.fine_amount)).toLocaleString()}
                                </div>
                                <button
                                  onClick={() => handlePayChallan(c.id)}
                                  style={{
                                    marginTop: '4px',
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    color: '#059669',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Mark Paid
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VEHICLES REGISTRY */}
              {activeTab === 'vehicles' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                        Vehicle & RC Registry
                      </h1>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        {filteredVehicles.length} total vehicles registered in database.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Search plate, owner, model, RTO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '9px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          minWidth: '260px',
                          outline: 'none',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)',
                        }}
                      />
                      <button
                        onClick={() => setShowAddVehicleModal(true)}
                        style={{
                          background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '9px 16px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                        }}
                      >
                        + Add Vehicle
                      </button>
                    </div>
                  </div>

                  {/* Vehicles Table */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #fce7f3',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.05)',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #fce7f3', background: '#fdf2f8', color: '#9d174d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '14px 16px' }}>Reg Plate</th>
                          <th style={{ padding: '14px 16px' }}>Owner Name</th>
                          <th style={{ padding: '14px 16px' }}>Make & Model</th>
                          <th style={{ padding: '14px 16px' }}>Fuel / Class</th>
                          <th style={{ padding: '14px 16px' }}>RTO Office</th>
                          <th style={{ padding: '14px 16px' }}>Insurance</th>
                          <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '44px 20px', color: '#64748b' }}>
                              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚗</div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>
                                No vehicles registered yet
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '380px', margin: '0 auto 16px' }}>
                                Register a vehicle here to store it permanently in the database.
                              </div>
                              <button
                                onClick={() => setShowAddVehicleModal(true)}
                                style={{
                                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                  border: 'none',
                                  color: '#ffffff',
                                  padding: '10px 20px',
                                  borderRadius: '10px',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                                }}
                              >
                                + Register New Vehicle
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredVehicles.map((veh, idx) => (
                            <tr
                              key={veh.id}
                              style={{
                                borderBottom: '1px solid #fce7f3',
                                background: idx % 2 === 0 ? 'transparent' : '#fff8fa',
                              }}
                            >
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: '#fdf2f8',
                                  border: '1px solid #f472b6',
                                  color: '#be185d',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  letterSpacing: '0.05em',
                                }}>
                                  {veh.registration_number}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                                {veh.owner_name}
                              </td>
                              <td style={{ padding: '14px 16px', color: '#1e293b' }}>
                                {veh.maker_model}
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{veh.engine_capacity_cc} CC</div>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#475569' }}>
                                <span style={{
                                  fontSize: '11px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                }}>
                                  {veh.fuel_type}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                                {veh.rto_office}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: veh.insurance_status === 'ACTIVE'
                                    ? '#ecfdf5'
                                    : veh.insurance_status === 'EXPIRING_SOON'
                                    ? '#fef3c7'
                                    : '#fff1f2',
                                  border: veh.insurance_status === 'ACTIVE'
                                    ? '1px solid #a7f3d0'
                                    : veh.insurance_status === 'EXPIRING_SOON'
                                    ? '1px solid #fde68a'
                                    : '1px solid #fecdd3',
                                  color: veh.insurance_status === 'ACTIVE'
                                    ? '#059669'
                                    : veh.insurance_status === 'EXPIRING_SOON'
                                    ? '#d97706'
                                    : '#e11d48',
                                }}>
                                  {veh.insurance_status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setSelectedVehicle(veh)}
                                    style={{
                                      background: '#fdf2f8',
                                      border: '1px solid #fbcfe8',
                                      color: '#be185d',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVehicle(veh.registration_number)}
                                    style={{
                                      background: '#fff1f2',
                                      border: '1px solid #fecdd3',
                                      color: '#e11d48',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TRAFFIC CHALLANS */}
              {activeTab === 'challans' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                        Traffic Challan Management
                      </h1>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        {filteredChallans.length} challans matching filters.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #fbcfe8', borderRadius: '10px', padding: '3px', boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)' }}>
                        {(['ALL', 'PENDING', 'PAID'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setChallanFilter(f)}
                            style={{
                              background: challanFilter === f ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' : 'transparent',
                              border: 'none',
                              color: challanFilter === f ? '#ffffff' : '#9d174d',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: challanFilter === f ? '0 2px 8px rgba(236, 72, 153, 0.25)' : 'none',
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Search challan #, plate, violation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '9px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          minWidth: '240px',
                          outline: 'none',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Challans Table */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #fce7f3',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.05)',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #fce7f3', background: '#fdf2f8', color: '#9d174d', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '14px 16px' }}>Challan No</th>
                          <th style={{ padding: '14px 16px' }}>Plate No</th>
                          <th style={{ padding: '14px 16px' }}>Violation</th>
                          <th style={{ padding: '14px 16px' }}>Offense Place & Date</th>
                          <th style={{ padding: '14px 16px' }}>Fine Amount</th>
                          <th style={{ padding: '14px 16px' }}>Status</th>
                          <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChallans.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No traffic challans in records</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                All vehicles in database currently have a clean violation record.
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredChallans.map((chal, idx) => (
                            <tr
                              key={chal.id}
                              style={{
                                borderBottom: '1px solid #fce7f3',
                                background: idx % 2 === 0 ? 'transparent' : '#fff8fa',
                              }}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                                {chal.challan_number}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: '#fdf2f8',
                                  border: '1px solid #f472b6',
                                  color: '#be185d',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                }}>
                                  {chal.vehicle_reg_no}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#1e293b' }}>
                                <div style={{ fontWeight: 600 }}>{chal.violation_title}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{chal.violation_description}</div>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                                <div>{chal.offense_place}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {new Date(chal.offense_date).toLocaleDateString()}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: chal.status === 'PENDING' ? '#e11d48' : '#059669', fontSize: '14px' }}>
                                ₹{parseFloat(String(chal.fine_amount)).toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: chal.status === 'PAID' ? '#ecfdf5' : '#fff1f2',
                                  border: chal.status === 'PAID' ? '1px solid #a7f3d0' : '1px solid #fecdd3',
                                  color: chal.status === 'PAID' ? '#059669' : '#e11d48',
                                }}>
                                  {chal.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                {chal.status === 'PENDING' ? (
                                  <button
                                    onClick={() => handlePayChallan(chal.id)}
                                    style={{
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      color: '#059669',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Settle Fine
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    Ref: {chal.payment_reference?.slice(0, 14)}...
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: INSURANCE VAULT */}
              {activeTab === 'policies' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                        Issued Insurance Policies
                      </h1>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        {filteredPolicies.length} digital policies stored in digital vault.
                      </p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search policy #, reg no, owner..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '9px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '13px',
                        minWidth: '260px',
                        outline: 'none',
                        boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)',
                      }}
                    />
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #fce7f3',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.05)',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #fce7f3', background: '#fdf2f8', color: '#9d174d', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '14px 16px' }}>Policy No</th>
                          <th style={{ padding: '14px 16px' }}>Reg No</th>
                          <th style={{ padding: '14px 16px' }}>Insurer</th>
                          <th style={{ padding: '14px 16px' }}>Policyholder</th>
                          <th style={{ padding: '14px 16px' }}>IDV Amount</th>
                          <th style={{ padding: '14px 16px' }}>Total Premium</th>
                          <th style={{ padding: '14px 16px' }}>Validity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPolicies.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
                              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No issued policies in vault yet</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Digital policy certificates will automatically appear here upon user purchase.
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredPolicies.map((pol, idx) => (
                            <tr
                              key={pol.id}
                              style={{
                                borderBottom: '1px solid #fce7f3',
                                background: idx % 2 === 0 ? 'transparent' : '#fff8fa',
                              }}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                                {pol.policy_number}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: '#fdf2f8',
                                  border: '1px solid #f472b6',
                                  color: '#be185d',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                }}>
                                  {pol.vehicle_reg_no}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                                {pol.insurer_name}
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{pol.plan_name}</div>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#1e293b' }}>
                                <div>{pol.owner_name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{pol.owner_phone}</div>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#475569' }}>
                                ₹{parseFloat(String(pol.idv_amount)).toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: '#059669' }}>
                                ₹{parseFloat(String(pol.total_premium)).toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                                {pol.start_date} to {pol.end_date}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: CLAIMS SURVEYOR DESK */}
              {activeTab === 'claims' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                        Claims Surveyor Desk
                      </h1>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        Review, audit, approve or settle insurance claims submitted by vehicle owners.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #fbcfe8', borderRadius: '10px', padding: '3px', boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)' }}>
                        {(['ALL', 'PENDING', 'APPROVED', 'SETTLED', 'REJECTED'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setClaimFilter(f)}
                            style={{
                              background: claimFilter === f ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' : 'transparent',
                              border: 'none',
                              color: claimFilter === f ? '#ffffff' : '#9d174d',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: claimFilter === f ? '0 2px 8px rgba(236, 72, 153, 0.25)' : 'none',
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Search claim #, plate, driver..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '9px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          minWidth: '220px',
                          outline: 'none',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #fce7f3',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.05)',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #fce7f3', background: '#fdf2f8', color: '#9d174d', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '14px 16px' }}>Claim Number</th>
                          <th style={{ padding: '14px 16px' }}>Vehicle Plate</th>
                          <th style={{ padding: '14px 16px' }}>Driver / Accident Place</th>
                          <th style={{ padding: '14px 16px' }}>Claimed Amount</th>
                          <th style={{ padding: '14px 16px' }}>Approved Settlement</th>
                          <th style={{ padding: '14px 16px' }}>Status</th>
                          <th style={{ padding: '14px 16px', textAlign: 'right' }}>Surveyor Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClaims.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📑</div>
                              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No insurance claims submitted</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                When users submit accident claims, they will appear here for surveyor review and settlement.
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredClaims.map((claim, idx) => (
                            <tr
                              key={claim.id}
                              style={{
                                borderBottom: '1px solid #fce7f3',
                                background: idx % 2 === 0 ? 'transparent' : '#fff8fa',
                              }}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                                {claim.claim_number}
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{claim.claim_type}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: '#fdf2f8',
                                  border: '1px solid #f472b6',
                                  color: '#be185d',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                }}>
                                  {claim.vehicle_reg_no}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#1e293b' }}>
                                <div style={{ fontWeight: 600 }}>{claim.driver_name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{claim.accident_place} ({claim.accident_date})</div>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#475569' }}>
                                ₹{parseFloat(String(claim.total_claimed_amount)).toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: '#059669' }}>
                                ₹{parseFloat(String(claim.approved_settlement_amount)).toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: claim.status === 'APPROVED' || claim.status === 'SETTLED'
                                    ? '#ecfdf5'
                                    : claim.status === 'REJECTED'
                                    ? '#fff1f2'
                                    : '#fef3c7',
                                  border: claim.status === 'APPROVED' || claim.status === 'SETTLED'
                                    ? '1px solid #a7f3d0'
                                    : claim.status === 'REJECTED'
                                    ? '1px solid #fecdd3'
                                    : '1px solid #fde68a',
                                  color: claim.status === 'APPROVED' || claim.status === 'SETTLED'
                                    ? '#059669'
                                    : claim.status === 'REJECTED'
                                    ? '#e11d48'
                                    : '#d97706',
                                }}>
                                  {claim.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setSelectedClaim(claim)}
                                    style={{
                                      background: '#fdf2f8',
                                      border: '1px solid #fbcfe8',
                                      color: '#be185d',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Details
                                  </button>
                                  {claim.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateClaimStatus(claim.claim_number, 'APPROVED')}
                                        style={{
                                          background: '#ecfdf5',
                                          border: '1px solid #a7f3d0',
                                          color: '#059669',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUpdateClaimStatus(claim.claim_number, 'REJECTED')}
                                        style={{
                                          background: '#fff1f2',
                                          border: '1px solid #fecdd3',
                                          color: '#e11d48',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {claim.status === 'APPROVED' && (
                                    <button
                                      onClick={() => handleUpdateClaimStatus(claim.claim_number, 'SETTLED')}
                                      style={{
                                        background: '#fdf2f8',
                                        border: '1px solid #f472b6',
                                        color: '#db2777',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Mark Settled
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: RTO MASTER DATA */}
              {activeTab === 'rto' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                        All-India RTO Master Directory
                      </h1>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        Complete database of {ALL_INDIA_RTO_OFFICES.length} Regional Transport Offices across Tamil Nadu and India.
                      </p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search RTO code (e.g. TN-92, TN-96, MH-01)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '9px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '13px',
                        minWidth: '280px',
                        outline: 'none',
                        boxShadow: '0 2px 6px rgba(236, 72, 153, 0.05)',
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '14px',
                  }}>
                    {filteredRTOs.map((rto: RtoOfficeItem) => (
                      <div
                        key={rto.code}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fce7f3',
                          borderRadius: '14px',
                          padding: '16px',
                          boxShadow: '0 4px 16px rgba(236, 72, 153, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            letterSpacing: '0.05em',
                            boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          }}>
                            {rto.code}
                          </span>
                          <span style={{ fontSize: '11px', color: '#be185d', fontWeight: 700 }}>
                            {rto.state}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                          {rto.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          City / Region: <strong style={{ color: '#0f172a' }}>{rto.city}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', lineHeight: '1.4' }}>
                          {rto.address}
                        </div>
                        <div style={{ fontSize: '11px', color: '#db2777', marginTop: '6px', fontWeight: 600 }}>
                          📞 {rto.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: SYSTEM DIAGNOSTICS */}
              {activeTab === 'system' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                      System Diagnostics & API Status
                    </h1>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Backend microservices and external RTO integration status.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #fce7f3',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.05)',
                    }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '14px' }}>
                        Core Services Health
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { name: 'Django REST API Engine', status: 'ONLINE', latency: '< 15ms' },
                          { name: 'MySQL Database Server', status: 'CONNECTED', latency: '< 5ms' },
                          { name: 'Free Parivahan e-Challan Scraper', status: 'READY', latency: 'On-Demand' },
                          { name: 'Masters India SBT Vahan API', status: 'ACTIVE', latency: 'Token Verified' },
                          { name: 'IRDAI Two-Wheeler Premium Engine', status: 'OPERATIONAL', latency: 'Rule Compliant' },
                        ].map(svc => (
                          <div
                            key={svc.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#fff8fa',
                              border: '1px solid #ffe4e6',
                              borderRadius: '10px',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{svc.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{svc.latency}</span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#059669',
                              }}>
                                ● {svc.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #fce7f3',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.05)',
                    }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '14px' }}>
                        Active Database Records
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce7f3', paddingBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Vehicles Table:</span>
                          <strong style={{ color: '#0f172a' }}>{stats?.vehicles.total ?? vehicles.length} rows</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce7f3', paddingBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Challans Table:</span>
                          <strong style={{ color: '#0f172a' }}>{stats?.challans.total ?? challans.length} rows</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce7f3', paddingBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Policies Vault Table:</span>
                          <strong style={{ color: '#0f172a' }}>{stats?.policies.total ?? policies.length} rows</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce7f3', paddingBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Insurance Claims Table:</span>
                          <strong style={{ color: '#0f172a' }}>{stats?.claims.total ?? claims.length} rows</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce7f3', paddingBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>RTO Mock Exam Pool:</span>
                          <strong style={{ color: '#0f172a' }}>{stats?.rto_questions ?? 15} questions</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Server Timestamp:</span>
                          <span style={{ color: '#db2777', fontSize: '11px', fontWeight: 600 }}>{stats?.server_time ?? new Date().toISOString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Modal: View Full Vehicle RC Details */}
          {selectedVehicle && (
            <div
              onClick={() => setSelectedVehicle(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fbcfe8',
                  borderRadius: '20px',
                  maxWidth: '560px',
                  width: '100%',
                  padding: '28px',
                  boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '8px',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)',
                    }}>
                      {selectedVehicle.registration_number}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                      RC Card Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', marginBottom: '24px' }}>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Owner Name</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.owner_name}</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Make & Model</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.maker_model}</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Engine Capacity</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.engine_capacity_cc} CC ({selectedVehicle.fuel_type})</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>RTO Office</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.rto_office}</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Registration Date</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.registration_date}</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Insurance Expiry</div>
                    <div style={{ fontWeight: 700, color: selectedVehicle.insurance_status === 'ACTIVE' ? '#059669' : '#e11d48', marginTop: '2px' }}>
                      {selectedVehicle.insurance_upto} ({selectedVehicle.insurance_status})
                    </div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Fitness Valid Upto</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.fitness_upto}</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>PUCC Valid Upto</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVehicle.pucc_upto || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => {
                      handleDeleteVehicle(selectedVehicle.registration_number);
                      setSelectedVehicle(null);
                    }}
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Vehicle
                  </button>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#475569',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: View Full Claim Details */}
          {selectedClaim && (
            <div
              onClick={() => setSelectedClaim(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fbcfe8',
                  borderRadius: '20px',
                  maxWidth: '620px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '28px',
                  boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                      Claim #{selectedClaim.claim_number}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Vehicle: <strong style={{ color: '#be185d' }}>{selectedClaim.vehicle_reg_no}</strong> &bull; {selectedClaim.claim_type}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Driver & License</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{selectedClaim.driver_name} ({selectedClaim.driver_license_no})</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Accident Date & Place</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{selectedClaim.accident_place} ({selectedClaim.accident_date})</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Assigned Workshop</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{selectedClaim.workshop_name} ({selectedClaim.workshop_type})</div>
                  </div>
                  <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: 600 }}>Surveyor</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{selectedClaim.surveyor_name}</div>
                  </div>
                </div>

                <div style={{ background: '#fff8fa', border: '1px solid #ffe4e6', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9d174d', marginBottom: '8px' }}>
                    Financial Settlement Breakdown
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Total Claimed Amount:</span>
                    <strong style={{ color: '#0f172a' }}>₹{parseFloat(String(selectedClaim.total_claimed_amount)).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Depreciation Deducted:</span>
                    <span style={{ color: '#e11d48' }}>-₹{parseFloat(String(selectedClaim.depreciation_deduction)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Compulsory Excess:</span>
                    <span style={{ color: '#e11d48' }}>-₹{parseFloat(String(selectedClaim.compulsory_excess)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid #fce7f3', paddingTop: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#be185d' }}>Approved Payout to Garage:</span>
                    <strong style={{ color: '#059669', fontSize: '16px' }}>
                      ₹{parseFloat(String(selectedClaim.approved_settlement_amount)).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  {selectedClaim.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateClaimStatus(selectedClaim.claim_number, 'APPROVED')}
                        style={{
                          background: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => handleUpdateClaimStatus(selectedClaim.claim_number, 'REJECTED')}
                        style={{
                          background: '#ef4444',
                          border: 'none',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Reject Claim
                      </button>
                    </>
                  )}
                  {selectedClaim.status === 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateClaimStatus(selectedClaim.claim_number, 'SETTLED')}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)',
                      }}
                    >
                      Settle & Disburse
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedClaim(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#475569',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add New Vehicle */}
          {showAddVehicleModal && (
            <div
              onClick={() => !submittingVehicle && setShowAddVehicleModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fbcfe8',
                  borderRadius: '20px',
                  maxWidth: '560px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '28px',
                  boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      Register Vehicle in Database
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Data will be stored directly into the MySQL database.
                    </p>
                  </div>
                  <button
                    disabled={submittingVehicle}
                    onClick={() => setShowAddVehicleModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>

                {createVehError && (
                  <div style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    color: '#e11d48',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span>⚠️</span>
                    <span>{createVehError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      Registration Number Plate *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TN92AB1234 or TN69AA1111"
                      value={newVehForm.registration_number}
                      onChange={(e) => handleRegNoChange(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(236, 72, 153, 0.04)',
                      }}
                    />
                    {newVehForm.rto_office && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#be185d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📍 Auto-detected RTO:</span>
                        <span style={{ fontWeight: 600 }}>{newVehForm.rto_office}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SENTHIL KUMARAN or MUTHU KRISHNAN"
                      value={newVehForm.owner_name}
                      onChange={(e) => setNewVehForm({ ...newVehForm, owner_name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(236, 72, 153, 0.04)',
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Maker & Model
                      </label>
                      <span style={{ fontSize: '11px', color: '#9d174d' }}>Quick picks:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Royal Enfield Classic 350"
                      value={newVehForm.maker_model}
                      onChange={(e) => setNewVehForm({ ...newVehForm, maker_model: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        marginBottom: '8px',
                        boxShadow: '0 1px 3px rgba(236, 72, 153, 0.04)',
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { label: 'RE Classic 350', model: 'Royal Enfield Classic 350', cc: 349 },
                        { label: 'Honda Activa 6G', model: 'Honda Activa 6G', cc: 110 },
                        { label: 'Yamaha R15 V4', model: 'Yamaha R15 V4', cc: 155 },
                        { label: 'TVS Jupiter 125', model: 'TVS Jupiter 125', cc: 125 },
                        { label: 'Hero Splendor+', model: 'Hero Splendor Plus', cc: 97 },
                      ].map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setNewVehForm(prev => ({ ...prev, maker_model: p.model, engine_capacity_cc: p.cc }))}
                          style={{
                            background: '#fff8fa',
                            border: '1px solid #fce7f3',
                            color: '#be185d',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          + {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Vehicle Class
                      </label>
                      <select
                        value={newVehForm.vehicle_class}
                        onChange={(e) => setNewVehForm({ ...newVehForm, vehicle_class: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      >
                        <option value="M-Cycle/Scooter(2WN)">Two Wheeler (2WN)</option>
                        <option value="Motor Car(LMV)">Four Wheeler Car (LMV)</option>
                        <option value="Three Wheeler(3WN)">Three Wheeler (Auto)</option>
                        <option value="Commercial Goods Vehicle">Commercial Goods</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Fuel Type
                      </label>
                      <select
                        value={newVehForm.fuel_type}
                        onChange={(e) => setNewVehForm({ ...newVehForm, fuel_type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      >
                        <option value="PETROL">PETROL</option>
                        <option value="ELECTRIC">ELECTRIC</option>
                        <option value="DIESEL">DIESEL</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Engine CC
                      </label>
                      <input
                        type="number"
                        value={newVehForm.engine_capacity_cc}
                        onChange={(e) => setNewVehForm({ ...newVehForm, engine_capacity_cc: parseInt(e.target.value) || 125 })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Registration Date
                      </label>
                      <input
                        type="date"
                        value={newVehForm.registration_date}
                        onChange={(e) => setNewVehForm({ ...newVehForm, registration_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: '#ffffff',
                          border: '1px solid #fbcfe8',
                          borderRadius: '10px',
                          color: '#0f172a',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Insurance Validity Upto
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setNewVehForm(p => ({ ...p, insurance_upto: getIsoDateString(365) }))}
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🟢 1 Year (Active)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewVehForm(p => ({ ...p, insurance_upto: getIsoDateString(15) }))}
                          style={{
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#d97706',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🟡 15 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewVehForm(p => ({ ...p, insurance_upto: getIsoDateString(-30) }))}
                          style={{
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#e11d48',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🔴 Expired
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      value={newVehForm.insurance_upto}
                      onChange={(e) => setNewVehForm({ ...newVehForm, insurance_upto: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      RTO Office
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. THOOTHUKUDI RTO, Tamil Nadu"
                      value={newVehForm.rto_office}
                      onChange={(e) => setNewVehForm({ ...newVehForm, rto_office: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#ffffff',
                        border: '1px solid #fbcfe8',
                        borderRadius: '10px',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      disabled={submittingVehicle}
                      onClick={() => setShowAddVehicleModal(false)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#475569',
                        padding: '11px 18px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: submittingVehicle ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingVehicle}
                      style={{
                        background: submittingVehicle
                          ? '#cbd5e1'
                          : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '11px 24px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: submittingVehicle ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {submittingVehicle ? (
                        <>
                          <IonSpinner name="dots" style={{ width: '18px', height: '18px' }} />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <span>💾 Save Vehicle to Database</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
