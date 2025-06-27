import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  type: 'medical_report' | 'id_verification' | 'blood_test';
  size: number;
  uploadDate: Date;
  status: 'pending' | 'verified' | 'rejected';
  url?: string;
}

const DocumentVerification: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Medical_Report_2023.pdf',
      type: 'medical_report',
      size: 1240000,
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'verified'
    },
    {
      id: '2',
      name: 'ID_Verification.jpg',
      type: 'id_verification',
      size: 850000,
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'verified'
    },
    {
      id: '3',
      name: 'Blood_Test_Results.pdf',
      type: 'blood_test',
      size: 980000,
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'pending'
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'medical_report' | 'id_verification' | 'blood_test'>('medical_report');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // In a real app, this would upload to Supabase Storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: uploadType,
        size: file.size,
        uploadDate: new Date(),
        status: 'pending'
      };

      setDocuments([...documents, newDocument]);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'medical_report': return 'Medical Report';
      case 'id_verification': return 'ID Verification';
      case 'blood_test': return 'Blood Test Results';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Documents</h3>
        <p className="text-gray-600 mb-6">
          Upload medical documents to verify your blood request. This helps donors trust your request and increases your chances of finding a match.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as any)}
              className="input-field"
            >
              <option value="medical_report">Medical Report</option>
              <option value="id_verification">ID Verification</option>
              <option value="blood_test">Blood Test Results</option>
            </select>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary inline-block cursor-pointer"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>Upload Document</span>
              </div>
            )}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </motion.div>

      {/* Document List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Documents</h3>
        
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{document.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{getDocumentTypeLabel(document.type)}</span>
                      <span>{formatFileSize(document.size)}</span>
                      <span>{document.uploadDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                  {getStatusIcon(document.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents uploaded
            </h3>
            <p className="text-gray-600">
              Upload your medical documents to verify your blood request.
            </p>
          </div>
        )}
      </motion.div>

      {/* Verification Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Verification Status</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Document Verification Process</h4>
              <p className="text-sm text-blue-800 mt-1">
                Our medical team reviews all documents within 24 hours. Verified documents increase your request's visibility and priority in the donor matching system.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-medium text-gray-900">ID Verification</div>
                  <div className={`text-sm mt-1 ${
                    documents.some(d => d.type === 'id_verification' && d.status === 'verified')
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {documents.some(d => d.type === 'id_verification' && d.status === 'verified')
                      ? 'Verified'
                      : 'Pending'
                    }
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-medium text-gray-900">Medical Report</div>
                  <div className={`text-sm mt-1 ${
                    documents.some(d => d.type === 'medical_report' && d.status === 'verified')
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {documents.some(d => d.type === 'medical_report' && d.status === 'verified')
                      ? 'Verified'
                      : 'Pending'
                    }
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="font-medium text-gray-900">Blood Test</div>
                  <div className={`text-sm mt-1 ${
                    documents.some(d => d.type === 'blood_test' && d.status === 'verified')
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {documents.some(d => d.type === 'blood_test' && d.status === 'verified')
                      ? 'Verified'
                      : 'Pending'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentVerification;