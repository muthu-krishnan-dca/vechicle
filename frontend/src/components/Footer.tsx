import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="official-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: About Vehicleinfo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="6" fill="#f8fafc" />
                  <rect x="4" y="10" width="24" height="3" rx="1.5" fill="#f97316" />
                  <rect x="4" y="22" width="24" height="3" rx="1.5" fill="#16a34a" />
                  <path d="M8 19L11 13H21L24 19V22H8V19Z" fill="#2563eb" />
                  <circle cx="11" cy="22" r="2.5" fill="#0f172a" />
                  <circle cx="21" cy="22" r="2.5" fill="#0f172a" />
                </svg>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
                Vehicleinfo
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#94a3b8', margin: '0 0 16px 0' }}>
              Vehicleinfo is India&apos;s premier digital vehicle services platform operated by AutoIQ Vehicle Info Private Limited, a Cars24 Company. It provides trusted Parivahan RC lookup, traffic e-challan online settlement, dynamic insurance comparison, and comprehensive vehicle records.
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
              <a href="#privacy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Privacy Policy</a>
              <span style={{ color: '#475569' }}>•</span>
              <a href="#terms" style={{ color: '#60a5fa', textDecoration: 'none' }}>Terms & Conditions</a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              <li><a onClick={() => navigate('/home')}>Home</a></li>
              <li><a onClick={() => navigate('/insurance')}>Insurance Quotes</a></li>
              <li><a onClick={() => navigate('/garage')}>My Garage & Vault</a></li>
              <li><a onClick={() => navigate('/services')}>RTO Services & Exam</a></li>
              <li><a onClick={() => alert('Parivahan Sarathi & Vahan RTO News 2026')}>RTO Blogs & News</a></li>
              <li><a onClick={() => alert('Support Helpline: 0261-4100244')}>Contact Us</a></li>
            </ul>
          </div>

          {/* Col 3: Top Features */}
          <div>
            <h4 className="footer-title">Top Features</h4>
            <ul className="footer-links">
              <li><a onClick={() => navigate('/home')}>Check RC Details</a></li>
              <li><a onClick={() => navigate('/home')}>Check & Pay eChallan</a></li>
              <li><a onClick={() => navigate('/services')}>Car History Report</a></li>
              <li><a onClick={() => navigate('/services')}>Sell Your Car</a></li>
              <li><a onClick={() => navigate('/services')}>FASTag Manager</a></li>
              <li><a onClick={() => navigate('/services')}>Vehicle Resale Value</a></li>
              <li><a onClick={() => navigate('/services')}>RTO Office Details</a></li>
            </ul>
          </div>

          {/* Col 4: Connect & Support */}
          <div>
            <h4 className="footer-title">Connect with Us</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {['📺 YouTube', '📸 Instagram', '💬 WhatsApp', '📘 Facebook', '💼 LinkedIn'].map((net) => (
                <span
                  key={net}
                  style={{
                    background: '#1e293b',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => alert(`Connect via ${net}`)}
                >
                  {net}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <div>📞 <strong>0261-4100244</strong> (Toll Free 24x7)</div>
              <div>📍 Gurgaon, Haryana, India</div>
              <div>✉️ support@vehicleinfo.app</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                ★ 4.5+ Rating
              </div>
              <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                10 Cr+ Users
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p style={{ margin: 0 }}>
            © 2026 Vehicleinfo. Operated by AutoIQ Vehicle Info Private Limited, a Cars24 Company. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>IRDAI Registered Portal</span>
            <span>Parivahan Vahan Compliant</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
