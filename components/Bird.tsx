
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
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
         {/* Tail (Lightning bolt) */}
         <path 
            d="M5 60 L25 60 L20 45 L35 45 L30 30 L10 50 Z" 
            fill="#FACC15" 
            stroke="#713F12" 
            strokeWidth="3" 
         />

         {/* Left Ear */}
         <path d="M25 25 L10 0 L40 20 Z" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
         <path d="M10 0 L16 10 L28 8 Z" fill="#1F2937" /> {/* Black Tip */}

         {/* Right Ear */}
         <path d="M75 25 L90 0 L60 20 Z" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
         <path d="M90 0 L84 10 L72 8 Z" fill="#1F2937" /> {/* Black Tip */}

         {/* Head/Body */}
         <ellipse cx="50" cy="55" rx="42" ry="38" fill="#FACC15" stroke="#713F12" strokeWidth="3" />

         {/* Cheeks */}
         <circle cx="18" cy="60" r="8" fill="#EF4444" />
         <circle cx="82" cy="60" r="8" fill="#EF4444" />

         {/* Eyes */}
         <circle cx="35" cy="45" r="6" fill="#1F2937" />
         <circle cx="37" cy="43" r="2" fill="white" />
         
         <circle cx="65" cy="45" r="6" fill="#1F2937" />
         <circle cx="67" cy="43" r="2" fill="white" />

         {/* Nose */}
         <circle cx="50" cy="55" r="2" fill="#1F2937" />

         {/* Mouth */}
         <path d="M42 65 Q50 70 58 65" fill="none" stroke="#713F12" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
