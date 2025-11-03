import React from 'react';

const PlayerAvatar = ({ color, size = 64 }) => {
  const numToCssHex = (num) => "#" + num.toString(16).padStart(6, "0");

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <filter
          id="shadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#000"
            floodOpacity="0.18"
          />
        </filter>
      </defs>
      <g id="body">
        <circle
          cx="50"
          cy="44"
          r="24"
          fill={numToCssHex(color)}
          stroke="#111"
          strokeWidth="1.8"
          filter="url(#shadow)"
        />
        <g id="eyes" transform="translate(0,0)">
          <circle cx="42" cy="40" r="3.7" fill="#000" />
          <circle cx="58" cy="40" r="3.7" fill="#000" />
        </g>
        <path
          d="M40 52 Q50 60 60 52"
          stroke="#111"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g id="arms" transform="translate(0,0)">
        <line
          x1="22"
          y1="50"
          x2="6"
          y2="66"
          stroke="#111"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="78"
          y1="50"
          x2="94"
          y2="66"
          stroke="#111"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g id="legs">
        <line
          x1="42"
          y1="68"
          x2="36"
          y2="86"
          stroke="#111"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="58"
          y1="68"
          x2="64"
          y2="86"
          stroke="#111"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default PlayerAvatar;