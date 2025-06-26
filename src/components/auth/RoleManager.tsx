import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface RoleTransition {
  id: string;
  fromRole: string;
  toRole: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface RoleManagerProps {
  userId?: string;
  isAdmin?: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({ userId, isAdmin = false }) => {
  const { user, updateProfile } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'donor');
  const [pendingTransitions, setPendingTransitions] = useState<RoleTransition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [transitionData, setTransitionData] = useState({
    toRole: 'recipient' as 'donor' | 'recipient' | 'admin',
    reason: ''
  });

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadPendingTransitions();
    }
  }, [targetUserId]);

  const loadPendingTransitions = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem(`role_transitions_${targetUserId}`);
      if (stored) {
        const transitions = JSON.parse(stored).map((t: any) => ({
          ...t,
          requestedAt: new Date(t.requestedAt),
          reviewedAt: t.reviewedAt ? new Date(t.reviewedAt) : undefined
        }));
        setPendingTransitions(transitions);
      }
    } catch (error) {
      console.error('Failed to load role transitions:', error);
    }
  };

  const requestRoleTransition = async () => {
    if (!targetUserId || !transitionData.reason.trim()) {
      toast.error('Please provide a reason for the role change');
      return;
    }

    setIsLoading(true);
    try {
      const newTransition: RoleTransition = {
        id: `transition_${Date.now()}`,
        fromRole: currentRole,
        toRole: transitionData.toRole,
        reason: transitionData.reason,
        status: 'pending',
        requestedAt: new Date()
      };

      const updated = [...pendingTransitions, newTransition];
      setPendingTransitions(updated);
      
      // Store in localStorage (in real app, this would go to Supabase)
      localStorage.setItem(`role_transitions_${targetUserId}`, JSON.stringify(updated));
      
      // Record in transaction history
      await SupabaseService.recordTransaction({
        user_id: targetUserId,
        transaction_hash: `role_transition_${newTransition.id}`,
        transaction_type: 'request',
        status: 'pending',
        metadata: {
          type: 'role_transition',
          fromRole: currentRole,
          toRole: transitionData.toRole,
          reason: transitionData.reason
        }
      });

      toast.success('Role transition request submitted for review');
      setShowTransitionForm(false);
      setTransitionData({ toRole: 'recipient', reason: '' });
    } catch (error) {
      console.error('Failed to request role transition:', error);
      toast.error('Failed to submit role transition request');
    } finally {
      setIsLoading(false);
    }
  };

  const reviewTransition = async (transitionId: string, approved: boolean) => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      const updated = pendingTransitions.map(t => 
        t.id === transitionId 
          ? { 
              ...t, 
              status: approved ? 'approved' : 'rejected',
              reviewedAt: new Date(),
              reviewedBy: user?.id
            }
          : t
      );
      
      setPendingTransitions(updated);
      localStorage.setItem(`role_transitions_${targetUserId}`, JSON.stringify(updated));

      const transition = updated.find(t => t.id === transitionId);
      
      if (approved && transition) {
        // Update user role in database
        await SupabaseService.updateUserProfile(targetUserId!, { role: transition.toRole });
        
        // Update local state if it's the current user
        if (targetUserId === user?.id) {
          await updateProfile({ role: transition.toRole });
          setCurrentRole(transition.toRole);
        }
        
        toast.success(`Role transition ${approved ? 'approved' : 'rejected'}`);
      }

      // Update transaction status
      await SupabaseService.updateTransactionStatus(
        `role_transition_${transitionId}`,
        approved ? 'confirmed' : 'failed'
      );

    } catch (error) {
      console.error('Failed to review transition:', error);
      toast.error('Failed to process role transition');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'donor': return 'bg-red-100 text-red-800 border-red-200';
      case 'recipient': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const canRequestTransition = () => {
    return !pendingTransitions.some(t => t.status === 'pending') && !isAdmin;
  };

  return (
    <div className="space-y-6">
      {/* Current Role Display */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
          </div>
          
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(currentRole)}`}>
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900">Donor Permissions</h4>
            <ul className="text-sm text-red-700 mt-2 space-y-1">
              <li>• Donate blood</li>
              <li>• Track donations</li>
              <li>• View requests</li>
              <li>• Communicate with recipients</li>
            </ul>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Recipient Permissions</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Request blood</li>
              <li>• Update requests</li>
              <li>• Withdraw requests</li>
              <li>• Communicate with donors</li>
            </ul>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">Admin Permissions</h4>
            <ul className="text-sm text-purple-700 mt-2 space-y-1">
              <li>• Override all permissions</li>
              <li>• Configure system</li>
              <li>• Manage roles</li>
              <li>• Emergency controls</li>
            </ul>
          </div>
        </div>

        {canRequestTransition() && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowTransitionForm(true)}
              className="btn-outline"
            >
              Request Role Change
            </button>
          </div>
        )}
      </div>

      {/* Role Transition Form */}
      {showTransitionForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Role Transition</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Role
              </label>
              <select
                value={transitionData.toRole}
                onChange={(e) => setTransitionData(prev => ({ 
                  ...prev, 
                  toRole: e.target.value as 'donor' | 'recipient' | 'admin' 
                }))}
                className="input-field"
              >
                <option value="donor">Donor</option>
                <option value="recipient">Recipient</option>
                {isAdmin && <option value="admin">Admin</option>}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change
              </label>
              <textarea
                value={transitionData.reason}
                onChange={(e) => setTransitionData(prev => ({ ...prev, reason: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Please explain why you need this role change..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTransitionForm(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={requestRoleTransition}
                disabled={isLoading || !transitionData.reason.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending Transitions */}
      {pendingTransitions.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Role Transition History</h4>
          
          <div className="space-y-4">
            {pendingTransitions.map((transition) => (
              <div key={transition.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transition.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {transition.fromRole} → {transition.toRole}
                      </p>
                      <p className="text-sm text-gray-600">{transition.reason}</p>
                      <p className="text-xs text-gray-500">
                        Requested: {transition.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transition.status === 'approved' ? 'bg-green-100 text-green-800' :
                      transition.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transition.status}
                    </span>
                    
                    {isAdmin && transition.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => reviewTransition(transition.id, true)}
                          disabled={isLoading}
                          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewTransition(transition.id, false)}
                          disabled={isLoading}
                          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Security Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Role transitions are reviewed by administrators to ensure platform security. 
              All role changes are recorded on the blockchain for transparency and audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;