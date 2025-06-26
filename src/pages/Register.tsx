import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthFlow from '../components/auth/AuthFlow';
import BloodDropletLogo from '../components/BloodDropletLogo';

const Register: React.FC = () => {
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <BloodDropletLogo size="xl" animated />
            <h1 className="text-3xl font-bold text-gradient">LIFEFLOW</h1>
          </div>
          <p className="text-gray-600">
            Join the revolution in blood donation
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AuthFlow 
            mode="register" 
            onModeChange={() => window.location.href = '/login'}
            onSuccess={() => window.location.href = '/dashboard'}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Register;