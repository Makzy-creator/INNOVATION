import React from 'react';
import { motion } from 'framer-motion';

interface BloodDropletLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const BloodDropletLogo: React.FC<BloodDropletLogoProps> = ({ 
  size = 'md', 
  className = '',
  animated = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const dropletVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: { 
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      variants={animated ? dropletVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Blood droplet shape */}
        <path
          d="M12 2C12 2 6 8 6 14C6 17.314 8.686 20 12 20C15.314 20 18 17.314 18 14C18 8 12 2 12 2Z"
          fill="url(#bloodGradient)"
          stroke="url(#bloodStroke)"
          strokeWidth="0.5"
        />
        
        {/* Heart symbol inside droplet */}
        <path
          d="M12 16.5C12 16.5 9.5 14.5 9.5 12.5C9.5 11.67 10.17 11 11 11C11.42 11 11.8 11.2 12 11.5C12.2 11.2 12.58 11 13 11C13.83 11 14.5 11.67 14.5 12.5C14.5 14.5 12 16.5 12 16.5Z"
          fill="white"
          opacity="0.9"
        />
        
        {/* Highlight for 3D effect */}
        <ellipse
          cx="10"
          cy="8"
          rx="1.5"
          ry="2"
          fill="white"
          opacity="0.3"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="bloodStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

export default BloodDropletLogo;