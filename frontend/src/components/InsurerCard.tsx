import React, { useState } from 'react';
import { IonCard, IonCardContent, IonButton, IonBadge, IonIcon } from '@ionic/react';
import { shieldCheckmarkOutline, constructOutline, informationCircleOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { InsurerQuote } from '../services/api';

interface InsurerCardProps {
  quote: InsurerQuote;
  onSelect: (quote: InsurerQuote) => void;
}

export const InsurerCard: React.FC<InsurerCardProps> = ({ quote, onSelect }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <IonCard className="glass-card" style={{ margin: '0 0 16px 0', borderLeft: `4px solid ${quote.brand_color}` }}>
      <IonCardContent style={{ padding: '16px 18px' }}>
        {/* Top row: Insurer Name, Rating, and Special Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: quote.brand_color,
                }}
              />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                {quote.insurer_name}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                ★ <strong style={{ color: '#f59e0b' }}>{quote.rating}</strong>/5.0 Customer Rating
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                IDV: ₹{quote.idv.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <IonBadge
            style={{
              '--background': 'rgba(6, 182, 212, 0.15)',
              '--color': '#22d3ee',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            {quote.tag}
          </IonBadge>
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '14px 0 12px 0', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1' }}>
            <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#10b981', fontSize: '1rem' }} />
            <span>Claim Ratio: <strong style={{ color: '#10b981' }}>{quote.claim_settlement_ratio}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1' }}>
            <IonIcon icon={constructOutline} style={{ color: '#38bdf8', fontSize: '1rem' }} />
            <span>Cashless Garages: <strong style={{ color: '#38bdf8' }}>{quote.cashless_garages}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
            <IonIcon icon={informationCircleOutline} style={{ color: '#a855f7', fontSize: '1rem' }} />
            <span>{quote.highlight}</span>
          </div>
        </div>

        {/* Pricing & CTA Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Final Price (incl. 18% GST)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit' }}>
                ₹{Math.round(quote.total_premium).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ 1 Year</span>
            </div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              style={{
                background: 'none',
                border: 'none',
                color: '#06b6d4',
                padding: 0,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
                fontWeight: 600,
              }}
            >
              {showBreakdown ? 'Hide Breakdown' : 'View Premium Breakdown'}
              <IonIcon icon={showBreakdown ? chevronUpOutline : chevronDownOutline} />
            </button>
          </div>

          <IonButton
            onClick={() => onSelect(quote)}
            style={{
              '--background': '#06b6d4',
              '--background-hover': '#0891b2',
              '--color': '#ffffff',
              '--border-radius': '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              height: '42px',
              minWidth: '150px',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
            }}
          >
            Select & Buy Now
          </IonButton>
        </div>

        {/* Collapsible IRDAI Breakdown */}
        {showBreakdown && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '4px' }}>
              IRDAI Formula Calculation
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8' }}>
              <span>Basic Own Damage (OD Gross)</span>
              <span>₹{quote.od_gross.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#10b981' }}>
              <span>Less: NCB Discount ({quote.ncb_percent}%)</span>
              <span>- ₹{quote.ncb_discount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#cbd5e1', fontWeight: 600 }}>
              <span>Net Own Damage (OD)</span>
              <span>₹{quote.od_net.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8' }}>
              <span>Third Party Liability (Mandatory TP)</span>
              <span>₹{quote.tp_amount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#94a3b8' }}>
              <span>Selected Add-ons Total ({quote.selected_addons.length})</span>
              <span>₹{quote.addons_total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', color: '#f1f5f9', fontWeight: 600 }}>
              <span>Net Premium (OD + TP + Addons)</span>
              <span>₹{quote.net_premium.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8' }}>
              <span>GST @ 18%</span>
              <span>₹{quote.gst_amount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', color: '#38bdf8', fontWeight: 800, fontSize: '0.9rem' }}>
              <span>Final Total Payable</span>
              <span>₹{quote.total_premium.toFixed(2)}</span>
            </div>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
