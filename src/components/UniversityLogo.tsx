import React from "react";

interface LogoProps {
  className?: string;
  watermark?: boolean;
}

export default function UniversityLogo({ className = "w-24 h-24", watermark = false }: LogoProps) {
  // Watermark has ultra-faint colors, standard has rich colors matching the image
  const opacity = watermark ? "opacity-12" : "opacity-100";
  const strokeColor = watermark ? "rgba(30, 58, 138, 0.2)" : "#4b5563"; // Elegant charcoal outline
  const ribbonColor = watermark ? "rgba(14, 116, 144, 0.2)" : "#4fb3ce"; // Exact beautiful cyan
  const capColor = watermark ? "rgba(51, 65, 85, 0.2)" : "#374151"; // Real graduation cap dark charcoal
  const tasselColor = watermark ? "rgba(234, 179, 8, 0.2)" : "#fab805"; // Scholastic gold tassel
  const textColor = watermark ? "rgba(30, 58, 138, 0.25)" : "#09090b"; // Fine calligraphic deep black
  const ribbonTextColor = watermark ? "rgba(255, 255, 255, 0.2)" : "#5a1818"; // Beautiful deep red/burgundy as in the uploaded image

  return (
    <div className={`relative flex items-center justify-center select-none ${className} ${opacity}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Diamond Shield */}
        <path
          d="M200 40 L360 200 L200 360 L40 200 Z"
          fill={watermark ? "transparent" : "#b5babf"} // Silver-grey backdrop matching the uploaded logo shield
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        
        {/* Inner Accent Line */}
        <path
          d="M200 55 L345 200 L200 345 L55 200 Z"
          stroke={watermark ? "rgba(30, 58, 138, 0.1)" : "#9ca3af"}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeDasharray="4 4"
        />

        {/* Graduation Cap - Skullcap */}
        <path
          d="M175 145 C175 145 175 178 200 178 C225 178 225 145 225 145"
          fill={capColor}
          stroke={strokeColor}
          strokeWidth="3.5"
        />

        {/* Graduation Cap - Mortarboard */}
        <polygon
          points="200,90 310,130 200,170 90,130"
          fill={capColor}
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Graduation Cap - Tassel */}
        <path
          d="M200 130 Q170 140 162 170 C160 185 163 192 163 192"
          stroke={tasselColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Hanging Tassel Fringe */}
        <polygon
          points="155,190 171,190 163,222"
          fill={tasselColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        
        <circle cx="200" cy="130" r="6" fill={strokeColor} />

        {/* Brand Text In Arabic font style */}
        <g transform="translate(200, 260)">
          {/* Main calligraphy-like text for "الجامعة" */}
          <text
            x="0"
            y="-5"
            textAnchor="middle"
            fill={textColor}
            fontSize="52"
            fontWeight="bold"
            fontFamily="Cairo, sans-serif"
            letterSpacing="1"
          >
            الجامعة
          </text>
        </g>

        {/* Ribbon Banner at the bottom of logo */}
        <g id="ribbon-group" transform="translate(0, 10)">
          {/* Ribbon tails left/right */}
          <path
            d="M50 280 L35 300 L65 310 Z"
            fill={watermark ? "rgba(14, 116, 144, 0.1)" : "#3b8fa3"}
            stroke={strokeColor}
            strokeWidth="3"
          />
          <path
            d="M350 280 L365 300 L335 310 Z"
            fill={watermark ? "rgba(14, 116, 144, 0.1)" : "#3b8fa3"}
            stroke={strokeColor}
            strokeWidth="3"
          />
          
          {/* Ribbon main body */}
          <path
            d="M50 285 L100 270 L300 270 L350 285 L330 315 L200 305 L70 315 Z"
            fill={ribbonColor}
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Text inside ribbon */}
          <text
            x="200"
            y="294"
            textAnchor="middle"
            fill={ribbonTextColor}
            fontSize="15"
            fontWeight="900"
            fontFamily="Tajawal, sans-serif"
          >
            للأستنساخ والطباعة والترجمة
          </text>
        </g>
      </svg>
    </div>
  );
}
