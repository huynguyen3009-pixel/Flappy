
import React from 'react';
import { BIRD_SIZE } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
}

export const Bird: React.FC<BirdProps> = ({ y, rotation }) => {
  return (
    <div
      className="absolute z-20 pointer-events-none transition-transform duration-75"
      style={{
        left: 100, // Fixed X position defined in constants
        top: y,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        transform: `rotate(${rotation}deg) scale(1.5)`, // Scale up slightly for better visual while keeping hitbox same
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
         {/* Body/Suit (Bottom) */}
         <path d="M10 85 Q50 95 90 85 L90 100 L10 100 Z" fill="#1e293b" /> {/* Dark Blue Suit */}
         
         {/* Shirt Collar */}
         <path d="M30 85 L50 100 L70 85" fill="white" />
         
         {/* Red Tie */}
         <path d="M46 85 L50 95 L54 85 L50 80 Z" fill="#ef4444" />

         {/* Face Shape */}
         <rect x="20" y="15" width="60" height="70" rx="25" ry="30" fill="#fde68a" /> {/* Skin tone */}

         {/* Hair (Back) */}
         <path d="M15 35 C15 10 85 10 85 35 L85 45 L80 45 L80 35 C80 15 20 15 20 35 L20 45 L15 45 Z" fill="#111827" />
         
         {/* Hair (Top/Side Part) */}
         <path d="M15 35 C15 15 40 15 55 25 C70 15 85 20 85 35" fill="#111827" />

         {/* Eyebrows */}
         <path d="M30 40 Q38 35 45 40" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
         <path d="M55 40 Q62 35 70 40" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />

         {/* Eyes (Closed/Squinting slightly for expression) */}
         <circle cx="38" cy="50" r="4" fill="#111827" />
         <circle cx="62" cy="50" r="4" fill="#111827" />

         {/* Glasses (Rimless style or subtle) */}
         <line x1="30" y1="50" x2="46" y2="50" stroke="#4b5563" strokeWidth="1" opacity="0.5" />
         <line x1="54" y1="50" x2="70" y2="50" stroke="#4b5563" strokeWidth="1" opacity="0.5" />
         <line x1="46" y1="50" x2="54" y2="50" stroke="#4b5563" strokeWidth="1" opacity="0.5" />

         {/* Nose */}
         <path d="M50 55 Q46 62 52 62" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

         {/* Mouth (Smile) */}
         <path d="M35 70 Q50 80 65 70" fill="none" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
         
         {/* Cheeks */}
         <circle cx="28" cy="60" r="5" fill="#f87171" opacity="0.4" />
         <circle cx="72" cy="60" r="5" fill="#f87171" opacity="0.4" />
      </svg>
    </div>
  );
};
