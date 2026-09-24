import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  lightBackground?: boolean;
}

export const AirwinLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  lightBackground = true,
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-20',
  };

  const textColor = lightBackground ? '#1A2A56' : '#FFFFFF';
  const redColor = '#D32F2F';
  const blueColor = '#1A2A56';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 90"
        className={`${heights[size]} w-auto object-contain transition-transform`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric 'A' Symbol */}
        <g id="airwin-symbol">
          {/* Left Red Wing */}
          <polygon points="45,10 5,72 24,72 45,35" fill={redColor} />
          {/* Right Red Wing */}
          <polygon points="45,10 85,72 66,72 45,35" fill="#B71C1C" />
          {/* Top Apex Red Cap */}
          <polygon points="45,10 32,32 58,32" fill="#E53935" />
          {/* Inner Navy Triangle Notch */}
          <polygon points="45,45 32,72 58,72" fill={blueColor} />
        </g>

        {/* Brand Text: IRWIN */}
        <g id="airwin-text">
          <text
            x="96"
            y="65"
            fontFamily="'Roboto', sans-serif"
            fontWeight="900"
            fontSize="54"
            letterSpacing="2"
            fill={textColor}
          >
            IRWIN
          </text>
        </g>

        {/* Dynamic Curved Red Swoosh */}
        <path
          d="M 96,70 Q 185,63 268,74"
          stroke={redColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* PIPES Subtext */}
        <g id="pipes-text">
          <text
            x="126"
            y="85"
            fontFamily="'Roboto', sans-serif"
            fontWeight="700"
            fontSize="12.5"
            letterSpacing="9"
            fill={textColor}
          >
            P I P E S
          </text>
        </g>
      </svg>

      {showSubtitle && (
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 mt-0.5">
          Agarsen Pipes & Fittings Pvt. Ltd.
        </span>
      )}
    </div>
  );
};
