import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="official-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: About Vehicleinfo */}
          <div>
            <div style={{ marginBottom: '14px' }}>
              <BrandLogo
                size={38}
                theme="dark"
                onClick={() => navigate('/rc-search')}
              />
            </div>

            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#94a3b8', margin: '0 0 16px 0' }}>
              Vehicleinfo is India&apos;s premier digital vehicle services platform{' '}
              <span
                onClick={() => {
                  sessionStorage.removeItem('vinfo_admin_auth');
                  localStorage.removeItem('vinfo_admin_auth');
                  navigate('/admin');
                }}
                style={{ cursor: 'pointer', color: 'inherit' }}
              >
                operated
              </span>{' '}
              by AutoIQ Vehicle Info Private Limited, a Cars24 Company. It provides trusted Parivahan RC lookup, traffic e-challan online settlement, dynamic insurance comparison, and comprehensive vehicle records.
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
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p style={{ margin: 0 }}>
            © 2026 Vehicleinfo.{' '}
            <span
              onClick={() => {
                sessionStorage.removeItem('vinfo_admin_auth');
                localStorage.removeItem('vinfo_admin_auth');
                navigate('/admin');
              }}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                color: 'inherit',
              }}
            >
              Operated
            </span>{' '}
            by AutoIQ Vehicle Info Private Limited, a Cars24 Company. All Rights Reserved.
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
