import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  timeOutline,
  shieldCheckmarkOutline,
  checkmarkCircle,
  chatbubbleEllipsesOutline,
  arrowForwardOutline,
  arrowUpOutline,
  bookOutline,
  navigateOutline,
  heart,
  heartOutline,
  shareSocialOutline,
  warningOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface NavSection {
  id: string;
  label: string;
  icon: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'insurance-benefits', label: '1. Insurance Benefits & Claim', icon: '🛡️' },
  { id: 'road-rules', label: '2. Highway & Road Rules', icon: '🛣️' },
  { id: 'traffic-rules', label: '3. Traffic Rules & AI Fines', icon: '🚦' },
  { id: 'flood-rti', label: '4. Flood & RTI Total Loss', icon: '🌊' },
  { id: 'bike-safety', label: '5. Two-Wheeler Safety & Helmet', icon: '🏍️' },
];

export const BlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string>('insurance-benefits');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = (sectionId: string) => {
    setLikedMap((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  // Scroll listener to update active tab & show back to top button
  const handleScroll = (e: any) => {
    const scrollTop = e.detail?.scrollTop || window.scrollY || 0;
    setShowScrollTop(scrollTop > 400);

    for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
      const el = document.getElementById(NAV_SECTIONS[i].id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 220) {
          setActiveNav(NAV_SECTIONS[i].id);
          break;
        }
      }
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <Header />
      </IonHeader>

      <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll} style={{ '--background': '#f8fafc' }}>
        <div className="app-content-container" style={{ paddingBottom: '80px' }}>
          {/* ================= PAGE HERO HEADER ================= */}
          <div
            style={{
              textAlign: 'center',
              padding: '36px 16px 20px 16px',
              maxWidth: '920px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                padding: '6px 18px',
                borderRadius: '30px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#1d4ed8',
                marginBottom: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <IonIcon icon={bookOutline} style={{ fontSize: '1.05rem', color: '#2563eb' }} />
              <span style={{ letterSpacing: '0.04em' }}>THE COMPLETE DRIVER’S JOURNAL & KNOWLEDGE HUB</span>
            </div>

            <h1
              style={{
                margin: '0 0 12px 0',
                fontSize: '2.6rem',
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.025em',
                lineHeight: 1.18,
              }}
            >
              Vehicle Stories, Insurance Benefits & Traffic Rules
            </h1>

            <p
              style={{
                margin: '0 auto 10px auto',
                fontSize: '1rem',
                color: '#64748b',
                maxWidth: '740px',
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              All key topics in a single continuous guide: Real accident claim breakthroughs, night highway survival rules, AI camera fines, and flood protection.
            </p>
          </div>

          {/* ================= STICKY SUB-NAV BAR (OREY PAGE NAV BAR) ================= */}
          <div
            style={{
              position: 'sticky',
              top: '0',
              zIndex: 999,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1.5px solid #e2e8f0',
              padding: '12px 16px',
              margin: '0 -16px 36px -16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              style={{
                maxWidth: '1180px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
              }}
            >
              {NAV_SECTIONS.map((sec) => {
                const isActive = activeNav === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '24px',
                      border: `1.5px solid ${isActive ? '#0f172a' : '#cbd5e1'}`,
                      background: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 4px 14px rgba(15, 23, 42, 0.22)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= STORIES STACKED VERTICALLY (KEELA KEELA) ================= */}
          <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', padding: '0 16px' }}>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 1: INSURANCE BENEFITS & ZERO-DEP REAL CLAIM STORY     */}
            {/* ------------------------------------------------------------- */}
            <article
              id="insurance-benefits"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                scrollMarginTop: '80px',
              }}
            >
              {/* Cover Photo */}
              <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src="/assets/story_car_crash.jpg"
                  alt="Rainy Night Car Crash"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  🛡️ SECTION 1 • INSURANCE BENEFITS & REAL CLAIM
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '32px 36px' }}>
                {/* Meta Byline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1d4ed8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      K
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Kumar & Surveyor Raghu</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Real Claim Experience • Chennai • Sep 18, 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={timeOutline} /> 4 min read
                    </span>
                    <button
                      onClick={() => toggleLike('insurance-benefits')}
                      style={{
                        background: likedMap['insurance-benefits'] ? '#fee2e2' : '#f8fafc',
                        color: likedMap['insurance-benefits'] ? '#ef4444' : '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={likedMap['insurance-benefits'] ? heart : heartOutline} />
                      <span>{likedMap['insurance-benefits'] ? 'Helpful' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleShare('Zero-Depreciation Insurance Story', 'How Zero-Dep Saved ₹48,000 on Kumar’s New Car')}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={shareSocialOutline} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit', lineHeight: 1.24 }}>
                  The Rainy Night Collision: How Zero-Dep Saved ₹48,000 on Kumar’s New SUV
                </h2>

                <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
                  A sudden braking incident on Chennai GST Road taught Kumar why third-party insurance is never enough for modern sensor-equipped vehicles.
                </p>

                {/* Narrative Intro */}
                <p style={{ fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.75, margin: '0 0 20px 0' }}>
                  Kumar had purchased his dream SUV just six months ago. While renewing his policy online, a friend urged him to include the Zero-Depreciation add-on. At the time, Kumar hesitated, wondering if it was an unnecessary extra expense. That single choice would prove to be one of the smartest financial decisions of his life.
                </p>

                {/* Chapter 1 */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '24px 0 10px 0', fontFamily: 'Outfit' }}>
                  Chapter 1: The Midnight Crash on GST Road
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: '0 0 16px 0' }}>
                  It was 9:30 PM on a stormy Friday near Tambaram. Torrential rain had reduced visibility to less than 20 meters. Suddenly, an unlit commercial truck braked abruptly in front. Despite slamming the ABS brakes, Kumar’s SUV skidded on the wet asphalt and crashed into the rear bumper. The impact shattered both LED projector headlamps, cracked the front fiber bumper into pieces, and damaged the radiator support bracket.
                </p>

                {/* Service Advisor Quote */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #1d4ed8',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <IonIcon icon={chatbubbleEllipsesOutline} style={{ color: '#1d4ed8', fontSize: '1.25rem' }} />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Raghu (Authorized Service Advisor)</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>- Hyundai Dealership Bodyshop</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.94rem', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.55 }}>
                    "Modern cars have fibre-composite bumpers and electronic matrix LED lamps. The total repair estimate is ₹54,000. Under a normal policy, 50% is deducted on plastic and lighting parts, meaning you would have to pay ₹28,000 from your own pocket. But because you have Zero-Dep, you pay only the ₹1,000 mandatory claim fee!"
                  </p>
                </div>

                {/* Resolution */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '24px 0 10px 0', fontFamily: 'Outfit' }}>
                  Chapter 2: Instant Video Inspection & Cashless Handover
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: '0 0 20px 0' }}>
                  Within 25 minutes, the authorized workshop completed a smartphone digital video inspection directly connected to the insurer's portal. The insurance approved ₹53,000 directly to the workshop under 100% Cashless settlement. 3 days later, Kumar drove home his fully restored car paying only ₹1,000!
                </p>

                {/* Insurance Benefits Grid */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={shieldCheckmarkOutline} />
                    Core Insurance Benefits Every Driver Must Know:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                      <strong style={{ color: '#1d4ed8', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        1. Zero-Depreciation (0-Dep)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        Eliminates the mandatory 50% depreciation deduction on plastic, fiber, and rubber components.
                      </span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                      <strong style={{ color: '#1d4ed8', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        2. 100% Cashless Garage Network
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        Repairs at over 5,000+ authorized workshops nationwide settled directly with the insurer.
                      </span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                      <strong style={{ color: '#1d4ed8', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        3. 24x7 Roadside Assistance (RSA)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        Emergency flat tyre assistance, towing, battery jump-start, and emergency fuel delivery.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/car-insurance')}
                    style={{
                      background: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)',
                    }}
                  >
                    <span>Check Zero-Dep Car Insurance (85% Off)</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>
              </div>
            </article>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: HIGHWAY & ROAD SAFETY RULES (5 GOLDEN RULES)        */}
            {/* ------------------------------------------------------------- */}
            <article
              id="road-rules"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                scrollMarginTop: '80px',
              }}
            >
              {/* Cover Photo */}
              <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src="/assets/story_night_highway.jpg"
                  alt="Night Highway Road"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#059669',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  🛣️ SECTION 2 • HIGHWAY & ROAD SAFETY RULES
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '32px 36px' }}>
                {/* Meta Byline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      P
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Priya Sundaram</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Road Safety Advocate • Bengaluru • Sep 15, 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={timeOutline} /> 5 min read
                    </span>
                    <button
                      onClick={() => toggleLike('road-rules')}
                      style={{
                        background: likedMap['road-rules'] ? '#fee2e2' : '#f8fafc',
                        color: likedMap['road-rules'] ? '#ef4444' : '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={likedMap['road-rules'] ? heart : heartOutline} />
                      <span>{likedMap['road-rules'] ? 'Helpful' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleShare('5 Road Rules Story', 'The Midnight Ooty Highway: 5 Life-Saving Road Rules')}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={shareSocialOutline} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit', lineHeight: 1.24 }}>
                  The Midnight Ooty Highway: 5 Life-Saving Road Rules Priya Learned from an RTO Inspector
                </h2>

                <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
                  A Bengaluru to Ooty road trip transformed into a masterclass on lane discipline, safe following distance, and high-beam etiquette.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.75, margin: '0 0 20px 0' }}>
                  As Priya entered the ghat section near Masinagudi at 11:00 PM, every third oncoming vehicle approached with blinding high-beam LED headlights. In the sudden glare, Priya lost sight of the road edges twice and almost drove onto the gravel shoulder. Shaken, she pulled over at the RTO Highway Safety Patrol checkpoint.
                </p>

                {/* Police Inspector Quote */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #059669',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <IonIcon icon={chatbubbleEllipsesOutline} style={{ color: '#059669', fontSize: '1.25rem' }} />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Inspector Natarajan</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>- Tamil Nadu Highway Patrol</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.94rem', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.55 }}>
                    "Amma, 40% of night highway fatal accidents occur because drivers use high beams continuously. High beams reflect back in mist and completely blind oncoming drivers for 3 to 5 seconds. Remember: Always switch to Low Beam when you see headlights 200 meters away!"
                  </p>
                </div>

                {/* The 5 Golden Highway Rules (Structured List) */}
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '18px',
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 900, color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#059669', fontSize: '1.3rem' }} />
                    The 5 Golden Highway Survival Rules:
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      {
                        num: '1',
                        title: 'High-Beam Courtesy (Dip Headlights at 200m)',
                        desc: 'Switch to Low Beam within 200m of oncoming vehicles and whenever following behind another vehicle.',
                      },
                      {
                        num: '2',
                        title: 'Right-Hand Overtaking Only',
                        desc: 'Undertaking from the left is illegal and the #1 cause of blind-spot collisions with heavy commercial trucks.',
                      },
                      {
                        num: '3',
                        title: 'The 3-Second Rule (5 Seconds in Rain)',
                        desc: 'Pick a stationary roadside marker. When the vehicle ahead passes it, count 3 seconds before your vehicle passes the same spot.',
                      },
                      {
                        num: '4',
                        title: 'Hairpin Ghat Uphill Priority',
                        desc: 'Vehicles travelling uphill on mountain roads have natural right-of-way over descending vehicles.',
                      },
                      {
                        num: '5',
                        title: 'Emergency Vehicle Protocol',
                        desc: 'Always steer to the left and halt immediately to provide an unobstructed corridor for ambulances and fire services.',
                      },
                    ].map((rule) => (
                      <div key={rule.num} style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1fae5', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ background: '#059669', color: '#ffffff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0, marginTop: '2px' }}>
                          {rule.num}
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#065f46', display: 'block', marginBottom: '2px' }}>
                            {rule.title}
                          </strong>
                          <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                            {rule.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/services')}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                    }}
                  >
                    <span>Take Practice RTO Mock Exam</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>
              </div>
            </article>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3: TRAFFIC RULES, AI CAMERAS & E-CHALLAN FINES        */}
            {/* ------------------------------------------------------------- */}
            <article
              id="traffic-rules"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                scrollMarginTop: '80px',
              }}
            >
              {/* Cover Photo */}
              <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src="/assets/story_traffic_camera.jpg"
                  alt="AI Traffic Camera Intersection"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#ea580c',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  🚦 SECTION 3 • TRAFFIC RULES, AI CAMERAS & FINES
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '32px 36px' }}>
                {/* Meta Byline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      R
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Ravi Shankar</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Tech Professional • Coimbatore • Sep 12, 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={timeOutline} /> 4 min read
                    </span>
                    <button
                      onClick={() => toggleLike('traffic-rules')}
                      style={{
                        background: likedMap['traffic-rules'] ? '#fee2e2' : '#f8fafc',
                        color: likedMap['traffic-rules'] ? '#ef4444' : '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={likedMap['traffic-rules'] ? heart : heartOutline} />
                      <span>{likedMap['traffic-rules'] ? 'Helpful' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleShare('Traffic Rules & Fines', 'Ravi’s Costly ₹16,000 Morning on AI Cameras & Expired Insurance')}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={shareSocialOutline} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit', lineHeight: 1.24 }}>
                  Ravi’s Costly ₹16,000 Morning: AI Cameras & Lapsed Insurance Wake-Up Call
                </h2>

                <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
                  Rushing to an urgent client meeting, Ravi accumulated 3 automated e-Challan fines before reaching his office desk.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.75, margin: '0 0 20px 0' }}>
                  Ravi threw his helmet loosely on his head without fastening the chin strap. At the Avinashi Road signal, seeing the amber light countdown, he accelerated through just as the light turned red. 500 meters down the road, an automated Intelligent Traffic Management (ITMS) AI camera zoomed in and recorded his license plate.
                </p>

                {/* SMS Notification Quote */}
                <div
                  style={{
                    background: '#fff7ed',
                    borderLeft: '4px solid #ea580c',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <IonIcon icon={warningOutline} style={{ color: '#ea580c', fontSize: '1.25rem' }} />
                    <strong style={{ fontSize: '0.88rem', color: '#9a3412' }}>Automated mParivahan e-Challan SMS Notification</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', fontStyle: 'italic', color: '#7c2d12', lineHeight: 1.55 }}>
                    "Challan No. TN26XXXX issued for vehicle TN38BZ1234: 1. Red Light Jump (Sec 184 - ₹1,000) 2. Unfastened Helmet (Sec 194D - ₹1,000) 3. Uninsured Vehicle (Sec 196 - ₹2,000). Total Fine: ₹4,000."
                  </p>
                </div>

                {/* 2026 Motor Vehicles Act Penalty Matrix */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #fed7aa',
                    borderRadius: '18px',
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 900, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
                    <span>⚖️</span>
                    Motor Vehicles Act 2026 Penalty & Fine Matrix:
                  </h4>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fdba74' }}>
                          <th style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 800 }}>Violation</th>
                          <th style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 800 }}>MVA Section</th>
                          <th style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 800 }}>Official Penalty</th>
                          <th style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 800 }}>License Consequence</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #fed7aa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>Driving Without Active Insurance</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>Section 196</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>₹2,000 (1st) / ₹4,000 (2nd)</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>Vehicle Impoundment</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #fed7aa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>Jumping Traffic Signal / Dangerous Driving</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>Section 184</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>₹1,000 to ₹5,000</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>3 Months Suspension</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #fed7aa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>No Helmet / Unfastened Chin Strap</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>Section 194D</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>₹1,000</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>3 Months Disqualification</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #fed7aa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>Using Mobile Phone While Driving</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>Section 184(c)</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>₹1,000 to ₹5,000</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>Court Summons</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>Over-Speeding Beyond Posted Limit</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>Section 183</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>₹1,000 (LMV) / ₹2,000 (HMV)</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>License Endorsement</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/home')}
                    style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                    }}
                  >
                    <span>Check Vehicle e-Challans Online</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>
              </div>
            </article>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4: FLOOD DISASTER & RETURN-TO-INVOICE (RTI)           */}
            {/* ------------------------------------------------------------- */}
            <article
              id="flood-rti"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                scrollMarginTop: '80px',
              }}
            >
              {/* Cover Photo */}
              <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src="/assets/story_flooded_car.jpg"
                  alt="Flooded Car Disaster"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#0284c7',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  🌊 SECTION 4 • MONSOON FLOOD & RETURN-TO-INVOICE
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '32px 36px' }}>
                {/* Meta Byline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      K
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Karthik Narayanan</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Sedan Owner • Madurai • Sep 08, 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={timeOutline} /> 4 min read
                    </span>
                    <button
                      onClick={() => toggleLike('flood-rti')}
                      style={{
                        background: likedMap['flood-rti'] ? '#fee2e2' : '#f8fafc',
                        color: likedMap['flood-rti'] ? '#ef4444' : '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={likedMap['flood-rti'] ? heart : heartOutline} />
                      <span>{likedMap['flood-rti'] ? 'Helpful' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleShare('Flood & RTI Total Loss', 'The Basement Flood Disaster: Why Return-To-Invoice Was Karthik’s Lifesaver')}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={shareSocialOutline} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit', lineHeight: 1.24 }}>
                  The Basement Flood Disaster: Why Return-To-Invoice (RTI) Was Karthik’s Miracle
                </h2>

                <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
                  When unprecedented monsoon water submerged Karthik’s sedan in an apartment basement, RTI refunded 100% of the showroom on-road price.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.75, margin: '0 0 20px 0' }}>
                  During the November cyclone, stormwater broke through the basement retaining wall. By 4:00 AM, 18 cars were fully submerged up to the roof. The engine block, automatic transmission ECU, touchscreen infotainment, and wiring harness suffered catastrophic water ingress. The service center declared the vehicle an Irreparable Total Loss.
                </p>

                {/* Adjuster Quote */}
                <div
                  style={{
                    background: '#f0f9ff',
                    borderLeft: '4px solid #0284c7',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <IonIcon icon={chatbubbleEllipsesOutline} style={{ color: '#0284c7', fontSize: '1.25rem' }} />
                    <strong style={{ fontSize: '0.88rem', color: '#0369a1' }}>Senior Claims Adjuster</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>- National General Insurance</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.94rem', fontStyle: 'italic', color: '#0c4a6e', lineHeight: 1.55 }}>
                    "Under a standard policy, your vehicle’s Insured Declared Value (IDV) is ₹9.8 Lakhs due to 20% age depreciation. But because you opted for the Return-to-Invoice (RTI) add-on, we will reimburse the full ₹12.5 Lakhs on-road original invoice price including road tax and registration!"
                  </p>
                </div>

                {/* Comparison Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '18px',
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                    💰 Normal Policy vs Return-To-Invoice (RTI) Claim Payout:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1.5px solid #fca5a5' }}>
                      <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>❌ Standard Comprehensive Policy</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991b1b', marginBottom: '6px' }}>₹9,80,000 Payout</div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        Customer loses ₹2,70,000 due to annual vehicle depreciation + unrefunded road tax.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '2px solid #22c55e' }}>
                      <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>✅ With RTI (Return-to-Invoice) Add-on</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d', marginBottom: '6px' }}>₹12,50,000 Full Settlement</div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        100% of original showroom on-road invoice refunded to purchase a brand-new replacement car!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/car-insurance')}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                    }}
                  >
                    <span>Get RTI Protected Car Insurance</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>
              </div>
            </article>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 5: TWO-WHEELER SAFETY & HELMET MANDATES               */}
            {/* ------------------------------------------------------------- */}
            <article
              id="bike-safety"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                scrollMarginTop: '80px',
              }}
            >
              {/* Cover Photo */}
              <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src="/assets/story_bike_safety.jpg"
                  alt="Motorcycle Highway Riding Safety"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#db2777',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  🏍️ SECTION 5 • TWO-WHEELER SAFETY & HELMET MANDATES
                </div>
              </div>

              {/* Story Content */}
              <div style={{ padding: '32px 36px' }}>
                {/* Meta Byline */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#db2777', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      A
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Arun & Dr. Senthil</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Motorcyclist & Trauma Specialist • Chennai • Sep 04, 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={timeOutline} /> 4 min read
                    </span>
                    <button
                      onClick={() => toggleLike('bike-safety')}
                      style={{
                        background: likedMap['bike-safety'] ? '#fee2e2' : '#f8fafc',
                        color: likedMap['bike-safety'] ? '#ef4444' : '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={likedMap['bike-safety'] ? heart : heartOutline} />
                      <span>{likedMap['bike-safety'] ? 'Helpful' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleShare('Two-Wheeler Road Safety', 'Arun’s Highway Skid: Why a Certified Full-Face Helmet & CPA Saved His Life')}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={shareSocialOutline} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit', lineHeight: 1.24 }}>
                  Arun’s Highway Skid: Why a Certified Full-Face Helmet & CPA Cover Saved His Life
                </h2>

                <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
                  A high-speed gravel slide on the East Coast Road proved why safety gear and compulsory personal accident cover are non-negotiable.
                </p>

                <p style={{ fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.75, margin: '0 0 20px 0' }}>
                  While riding towards Mahabalipuram on a Sunday morning, an unflagged sand spill on a curve caused sudden traction loss. Arun low-sided, his head impacting the tarmac before sliding onto the soft shoulder. The full-face helmet visor and chin shell absorbed the kinetic energy, preventing severe traumatic brain and facial injury.
                </p>

                {/* Surgeon Quote */}
                <div
                  style={{
                    background: '#fdf2f8',
                    borderLeft: '4px solid #db2777',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    margin: '20px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <IonIcon icon={chatbubbleEllipsesOutline} style={{ color: '#db2777', fontSize: '1.25rem' }} />
                    <strong style={{ fontSize: '0.88rem', color: '#9d174d' }}>Dr. Senthil Kumar</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>- Chief Trauma Surgeon, Apollo Emergency</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.94rem', fontStyle: 'italic', color: '#831843', lineHeight: 1.55 }}>
                    "70% of motorcycle fatalities involve head and facial impacts. Half-helmets offer zero chin and jaw protection. Arun’s full-face helmet prevented what could have been a fatal basilar skull fracture. Always fasten the strap!"
                  </p>
                </div>

                {/* Two-Wheeler Safety Points */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={checkmarkCircle} style={{ color: '#db2777' }} />
                    Non-Negotiable Two-Wheeler Safety Mandates:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#db2777', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        1. Certified Full-Face Helmet (ISI/DOT)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        Section 129 mandates ISI-marked helmets for both rider and pillion passenger.
                      </span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#db2777', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        2. Mandatory ₹15 Lakh CPA Cover
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        IRDAI mandated ₹15,00,000 Compulsory Personal Accident cover for total family security.
                      </span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#db2777', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                        3. Protective Gloves & Shoes
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                        Never ride in flip-flops or slippers; palm sliders prevent severe wrist dislocations in skids.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Action CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/bike-insurance')}
                    style={{
                      background: '#db2777',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(219, 39, 119, 0.25)',
                    }}
                  >
                    <span>Compare Bike Insurance & CPA Cover</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>
              </div>
            </article>

          </div>
        </div>

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => {
              const el = document.getElementById('insurance-benefits');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
              zIndex: 9999,
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <IonIcon icon={arrowUpOutline} style={{ fontSize: '1.3rem' }} />
          </button>
        )}

        {/* Official Footer */}
        <Footer />
      </IonContent>
    </IonPage>
  );
};
