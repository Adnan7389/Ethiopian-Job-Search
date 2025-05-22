import React from 'react';

const Logo = (props) => {
  return (
    <svg 
      width={props.width || "50"} 
      height={props.height || "50"} 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Ethiopia map outline */}
      <path 
        d="M166.5 115.5C143.7 128.7 102.5 155.5 80.5 182.5C58.5 209.5 63 234 65.5 258C68 282 89 305 128 323C167 341 195 330.5 235.5 323C276 315.5 312 312.5 339 334.5C366 356.5 380 372 394 383"
        stroke="#246342" 
        strokeWidth="12" 
        fill="none"
      />
      
      {/* Map bottom curve */}
      <path 
        d="M394 383C408 394 415.5 398.5 415.5 398.5" 
        stroke="#F4A940" 
        strokeWidth="12" 
        fill="none"
      />
      
      {/* Briefcase/map outline */}
      <rect 
        x="130" 
        y="170" 
        width="160" 
        height="150" 
        rx="12" 
        stroke="#246342" 
        strokeWidth="15" 
        fill="white"
      />
      
      {/* Briefcase handle */}
      <rect 
        x="170" 
        y="170" 
        width="80" 
        height="20" 
        fill="white" 
        stroke="#246342" 
        strokeWidth="15"
      />
      
      {/* Yellow person */}
      <circle 
        cx="170" 
        cy="230" 
        r="25" 
        fill="#F4A940" 
      />
      
      {/* Red person */}
      <circle 
        cx="220" 
        cy="210" 
        r="25" 
        fill="#C5413B" 
      />
      
      {/* Handshake */}
      <path 
        d="M180 255C185 250 200 245 215 250C230 255 235 260 240 265" 
        stroke="#C5413B" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
      <path 
        d="M175 265C180 260 195 255 215 265C235 275 238 280 240 285" 
        stroke="#F4A940" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
    </svg>
  );
};

export default Logo; 