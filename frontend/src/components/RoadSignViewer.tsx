import React from 'react';

interface RoadSignViewerProps {
  signCode?: string;
  size?: number;
}

export const RoadSignViewer: React.FC<RoadSignViewerProps> = ({ signCode, size = 120 }) => {
  const code = (signCode || '').toUpperCase();

  switch (code) {
    case 'STOP':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#dc2626" stroke="#ffffff" strokeWidth="4" />
          <polygon points="31,7 69,7 93,31 93,69 69,93 31,93 7,69 7,31" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
          <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif">STOP</text>
        </svg>
      );

    case 'GIVE_WAY':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <polygon points="10,15 90,15 50,85" fill="#ffffff" stroke="#dc2626" strokeWidth="10" strokeLinejoin="round" />
        </svg>
      );

    case 'NO_ENTRY':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#dc2626" stroke="#ffffff" strokeWidth="3" />
          <rect x="18" y="42" width="64" height="16" rx="2" fill="#ffffff" />
        </svg>
      );

    case 'SPEED_LIMIT_50':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="9" />
          <text x="50" y="61" textAnchor="middle" fill="#111827" fontSize="34" fontWeight="900" fontFamily="sans-serif">50</text>
        </svg>
      );

    case 'PEDESTRIAN_CROSSING':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <polygon points="50,8 92,85 8,85" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
          {/* Zebra stripes */}
          <line x1="28" y1="74" x2="72" y2="74" stroke="#1f2937" strokeWidth="2.5" strokeDasharray="5,4" />
          <line x1="32" y1="70" x2="68" y2="70" stroke="#1f2937" strokeWidth="2.5" strokeDasharray="5,4" />
          {/* Walking figure */}
          <circle cx="50" cy="40" r="4" fill="#1f2937" />
          <path d="M47,46 L53,46 L55,58 L51,68" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M52,54 L44,68" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M47,48 L40,56" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M53,48 L60,55" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'RIGHT_TURN_PROHIBITED':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="8" />
          {/* Arrow */}
          <path d="M40,68 L40,48 Q40,38 52,38 L62,38" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
          <polygon points="60,30 74,38 60,46" fill="#1f2937" />
          {/* Diagonal Slash */}
          <line x1="24" y1="24" x2="76" y2="76" stroke="#dc2626" strokeWidth="8" />
        </svg>
      );

    case 'U_TURN_PROHIBITED':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="8" />
          <path d="M60,68 L60,45 A12,12 0 0,0 36,45 L36,60" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
          <polygon points="28,58 36,70 44,58" fill="#1f2937" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#dc2626" strokeWidth="8" />
        </svg>
      );

    case 'OVERTAKING_PROHIBITED':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="8" />
          {/* Car 1 (Black) */}
          <rect x="25" y="44" width="20" height="26" rx="4" fill="#1f2937" />
          {/* Car 2 (Red overtaking) */}
          <rect x="52" y="36" width="20" height="26" rx="4" fill="#dc2626" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#dc2626" strokeWidth="7" />
        </svg>
      );

    case 'HORN_PROHIBITED':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="8" />
          <path d="M30,46 L44,46 L60,34 L60,66 L44,54 L30,54 Z" fill="#1f2937" />
          <path d="M66,42 Q72,50 66,58" fill="none" stroke="#1f2937" strokeWidth="3" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#dc2626" strokeWidth="8" />
        </svg>
      );

    case 'NARROW_ROAD_AHEAD':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <polygon points="50,8 92,85 8,85" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
          <path d="M32,74 L32,60 Q32,50 42,42 L42,32" stroke="#1f2937" strokeWidth="5" fill="none" />
          <path d="M68,74 L68,60 Q68,50 58,42 L58,32" stroke="#1f2937" strokeWidth="5" fill="none" />
        </svg>
      );

    case 'HOSPITAL_AHEAD':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <rect x="10" y="10" width="80" height="80" rx="8" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
          <rect x="16" y="16" width="68" height="68" rx="5" fill="#2563eb" />
          {/* Bed symbol */}
          <rect x="24" y="52" width="52" height="6" fill="#ffffff" rx="2" />
          <rect x="24" y="44" width="6" height="14" fill="#ffffff" rx="2" />
          <rect x="70" y="44" width="6" height="14" fill="#ffffff" rx="2" />
          {/* Red Cross symbol */}
          <rect x="46" y="24" width="8" height="20" fill="#dc2626" />
          <rect x="40" y="30" width="20" height="8" fill="#dc2626" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="road-sign-svg">
          <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#06b6d4" strokeWidth="4" />
          <path d="M50,20 L75,32 L75,58 Q75,76 50,84 Q25,76 25,58 L25,32 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <text x="50" y="58" textAnchor="middle" fill="#06b6d4" fontSize="24" fontWeight="bold">RTO</text>
        </svg>
      );
  }
};
