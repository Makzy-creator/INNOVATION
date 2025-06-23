import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoCameraIcon, PlayIcon } from '@heroicons/react/24/outline';
import TavusVideoAgent from './TavusVideoAgent';

interface TavusVideoButtonProps {
  triggerHook?: string;
  buttonText?: string;
  className?: string;
}

const TavusVideoButton: React.FC<TavusVideoButtonProps> = ({ 
  triggerHook, 
  buttonText = "Talk to Dr. Vita",
  className = ""
}) => {
  const [isVideoAgentOpen, setIsVideoAgentOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsVideoAgentOpen(true)}
        className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <VideoCameraIcon className="h-5 w-5" />
        <span className="font-medium">{buttonText}</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>

      <TavusVideoAgent
        isOpen={isVideoAgentOpen}
        onClose={() => setIsVideoAgentOpen(false)}
        triggerHook={triggerHook}
      />
    </>
  );
};

export default TavusVideoButton;