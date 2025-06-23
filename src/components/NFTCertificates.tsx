import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GiftIcon, 
  ShareIcon, 
  ArrowDownTrayIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import ICPService from '../services/icpService';
import toast from 'react-hot-toast';

interface NFTCertificate {
  tokenId: number;
  donationId: string;
  bloodType: string;
  amount: number;
  location: string;
  timestamp: number;
  imageUrl: string;
  attributes: [string, string][];
}

const NFTCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<NFTCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<NFTCertificate | null>(null);

  useEffect(() => {
    loadUserCertificates();
  }, []);

  const loadUserCertificates = async () => {
    try {
      if (!ICPService.isConnected()) {
        setIsLoading(false);
        return;
      }

      const nfts = await ICPService.getUserNFTs();
      setCertificates(nfts);
    } catch (error) {
      console.error('Failed to load NFT certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (certificate: NFTCertificate) => {
    try {
      const shareData = {
        title: `Blood Donation Certificate #${certificate.tokenId}`,
        text: `I donated ${certificate.amount}ml of ${certificate.bloodType} blood and received this blockchain-verified NFT certificate!`,
        url: `${window.location.origin}/certificate/${certificate.tokenId}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast.success('Certificate link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  const handleDownload = (certificate: NFTCertificate) => {
    // Create a downloadable certificate image/PDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#dc2626');
    gradient.addColorStop(1, '#0284c7');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add certificate content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Blood Donation Certificate', canvas.width / 2, 100);

    ctx.font = '24px Arial';
    ctx.fillText(`Token ID: #${certificate.tokenId}`, canvas.width / 2, 180);
    ctx.fillText(`Blood Type: ${certificate.bloodType}`, canvas.width / 2, 220);
    ctx.fillText(`Amount: ${certificate.amount}ml`, canvas.width / 2, 260);
    ctx.fillText(`Location: ${certificate.location}`, canvas.width / 2, 300);
    ctx.fillText(`Date: ${new Date(certificate.timestamp / 1000000).toLocaleDateString()}`, canvas.width / 2, 340);

    ctx.font = '16px Arial';
    ctx.fillText('Verified on Internet Computer Blockchain', canvas.width / 2, 420);
    ctx.fillText('Innovation Blood Donation Platform', canvas.width / 2, 450);

    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blood-donation-certificate-${certificate.tokenId}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded!');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading certificates...</span>
      </div>
    );
  }

  if (!ICPService.isConnected()) {
    return (
      <div className="text-center py-12">
        <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your Internet Computer wallet to view your NFT certificates
        </p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Certificates Yet
        </h3>
        <p className="text-gray-600">
          Your NFT certificates will appear here after you make blood donations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your NFT Certificates</h2>
        <p className="text-gray-600">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate, index) => (
          <motion.div
            key={certificate.tokenId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCertificate(certificate)}
          >
            {/* Certificate Image */}
            <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
              <div className="text-center">
                <HeartIcon className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold">Certificate #{certificate.tokenId}</h3>
                <p className="text-sm opacity-90">Blood Donation</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {certificate.bloodType}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {certificate.amount}ml
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {certificate.location}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(certificate.timestamp / 1000000).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(certificate);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(certificate);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Certificate Display */}
            <div className="h-64 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white relative">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <HeartIcon className="h-16 w-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Certificate #{selectedCertificate.tokenId}</h2>
                <p className="text-xl opacity-90">Blood Donation Verification</p>
              </div>
            </div>

            {/* Certificate Information */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedCertificate.bloodType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedCertificate.amount}ml</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedCertificate.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedCertificate.timestamp / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Blockchain Attributes</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCertificate.attributes.map(([key, value], index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{key}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleShare(selectedCertificate)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <ShareIcon className="h-5 w-5" />
                  <span>Share Certificate</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedCertificate)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NFTCertificates;