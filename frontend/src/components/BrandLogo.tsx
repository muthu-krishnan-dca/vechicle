import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 42,
  showText = true,
  theme = 'light',
  className,
  onClick,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* 3D Shield Emblem with Indian Tricolor & Aerodynamic Speed Car */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          filter: isDark
            ? 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4))'
            : 'drop-shadow(0 3px 10px rgba(15, 23, 42, 0.12))',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shield Outer Gradient */}
            <linearGradient id="vinfoShieldBg" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Shield Bevel Rim */}
            <linearGradient id="vinfoShieldRim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Saffron Ribbon Gradient */}
            <linearGradient id="saffronGrad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="100%" stopColor="#FF5500" />
            </linearGradient>

            {/* Green Ribbon Gradient */}
            <linearGradient id="greenGrad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#046A38" />
            </linearGradient>

            {/* Car Body Gradient */}
            <linearGradient id="carBodyGrad" x1="20" y1="40" x2="80" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Car Roof & Windshield Glass Reflection */}
            <linearGradient id="carGlassGrad" x1="40" y1="40" x2="60" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#93c5fd" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>

            {/* Headlight Beam Glow */}
            <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Subtle Drop Shadows */}
            <filter id="carDropShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. 3D Beveled Shield Base */}
          <path
            d="M50 4 
               C74 4, 91 12, 93 28 
               C93 58, 72 82, 50 96 
               C28 82, 7 58, 7 28 
               C9 12, 26 4, 50 4 Z"
            fill="url(#vinfoShieldBg)"
            stroke="url(#vinfoShieldRim)"
            strokeWidth="2.5"
          />

          {/* Shield Inner Gloss Edge */}
          <path
            d="M50 8 
               C70 8, 86 15, 88 29 
               C88 54, 69 76, 50 89 
               C31 76, 12 54, 12 29 
               C14 15, 30 8, 50 8 Z"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1.2"
          />

          {/* 2. Indian Flag Aerodynamic Racing Ribbons */}
          {/* Saffron Ribbon (Top Arc) */}
          <path
            d="M20 22 C 38 15, 62 15, 80 22 C 73 26, 60 21, 50 21 C 40 21, 27 26, 20 22 Z"
            fill="url(#saffronGrad)"
            filter="drop-shadow(0 2px 4px rgba(255, 107, 0, 0.4))"
          />

          {/* Pure White Speed Trail with Ashoka Blue Center Spark */}
          <path
            d="M26 27 C 40 23, 60 23, 74 27 C 68 29.5, 58 26.5, 50 26.5 C 42 26.5, 32 29.5, 26 27 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          {/* Micro Chakra Spark Emblem */}
          <circle cx="50" cy="27" r="2" fill="#1e3a8a" />
          <circle cx="50" cy="27" r="0.8" fill="#ffffff" />

          {/* India Green Ribbon (Lower Arc) */}
          <path
            d="M22 75 C 36 84, 64 84, 78 75 C 72 71, 60 76, 50 76 C 40 76, 28 71, 22 75 Z"
            fill="url(#greenGrad)"
            filter="drop-shadow(0 2px 4px rgba(4, 106, 56, 0.4))"
          />

          {/* 3. 3D Aerodynamic Speed Vehicle (Front Quarter Perspective) */}
          <g filter="url(#carDropShadow)">
            {/* Underbody Ground Shadow / Diffuser */}
            <path
              d="M22 66 C 30 63, 70 63, 78 66 C 73 70, 27 70, 22 66 Z"
              fill="#000000"
              opacity="0.85"
            />

            {/* Aerodynamic Wheels */}
            <ellipse cx="28" cy="64" rx="6" ry="6.5" fill="#0b0f19" stroke="#475569" strokeWidth="1.2" />
            <ellipse cx="28" cy="64" rx="3" ry="3.2" fill="#94a3b8" />
            <circle cx="28" cy="64" r="1.2" fill="#ffffff" />

            <ellipse cx="72" cy="64" rx="6" ry="6.5" fill="#0b0f19" stroke="#475569" strokeWidth="1.2" />
            <ellipse cx="72" cy="64" rx="3" ry="3.2" fill="#94a3b8" />
            <circle cx="72" cy="64" r="1.2" fill="#ffffff" />

            {/* Main Sports Car Body Shell */}
            <path
              d="M19 60 
                 C 20 56, 25 54, 32 54 
                 C 37 46, 42 41, 50 41 
                 C 58 41, 63 46, 68 54 
                 C 75 54, 80 56, 81 60 
                 C 82 64, 78 65.5, 75 65.5 
                 L 25 65.5 
                 C 22 65.5, 18 64, 19 60 Z"
              fill="url(#carBodyGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />

            {/* Sleek Aerodynamic Windshield / Greenhouse */}
            <path
              d="M34 53 
                 C 38 46, 43 43, 50 43 
                 C 57 43, 62 46, 66 53 
                 C 60 52, 40 52, 34 53 Z"
              fill="url(#carGlassGrad)"
            />

            {/* Hood Air Intake & Center Ridge Accent */}
            <path d="M50 44 L 50 56" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            <path d="M44 56 C 47 58, 53 58, 56 56" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" />

            {/* Angular LED Laser Headlights (Electric Cyan) */}
            {/* Left Headlight */}
            <polygon
              points="23,58 31,56 30,59 24,60"
              fill="#e0f2fe"
              stroke="#38bdf8"
              strokeWidth="0.6"
            />
            {/* Right Headlight */}
            <polygon
              points="77,58 69,56 70,59 76,60"
              fill="#e0f2fe"
              stroke="#38bdf8"
              strokeWidth="0.6"
            />

            {/* Headlight Beam Flashes */}
            <ellipse cx="23" cy="59" rx="3.5" ry="1.5" fill="url(#headlightGlow)" opacity="0.9" />
            <ellipse cx="77" cy="59" rx="3.5" ry="1.5" fill="url(#headlightGlow)" opacity="0.9" />

            {/* Front Bumper Splitter Accent */}
            <path
              d="M30 63 L 70 63"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          {/* 4. Speed Motion Dash Lines */}
          <line x1="10" y1="48" x2="16" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="6" y1="53" x2="14" y2="53" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="84" y1="48" x2="90" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="86" y1="53" x2="94" y2="53" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span
              style={{
                fontSize: size >= 40 ? '1.38rem' : '1.15rem',
                fontWeight: 900,
                color: isDark ? '#ffffff' : '#0f172a',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
              }}
            >
              Vehicle
            </span>
            <span
              style={{
                fontSize: size >= 40 ? '1.38rem' : '1.15rem',
                fontWeight: 900,
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Info
            </span>
            {/* Search Magnifier / Speed Spark */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '1px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16" y2="16" />
              </svg>
            </span>
          </div>

          {/* Subtitle / Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            {/* Micro Indian Flag Bars */}
            <div style={{ display: 'flex', gap: '1.5px', alignItems: 'center' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FF671F' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isDark ? '#ffffff' : '#94a3b8' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#046A38' }} />
            </div>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: isDark ? '#93c5fd' : '#2563eb',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ALL-IN-ONE VEHICLE SOLUTION
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default BrandLogo;
