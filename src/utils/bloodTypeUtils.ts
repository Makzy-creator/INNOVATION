// Blood type compatibility matrix
// Key: recipient blood type
// Value: object with donor blood types as keys and boolean compatibility as values
export const BLOOD_COMPATIBILITY_MATRIX: Record<string, Record<string, boolean>> = {
  'A+': {
    'A+': true,
    'A-': true,
    'O+': true,
    'O-': true,
    'B+': false,
    'B-': false,
    'AB+': false,
    'AB-': false
  },
  'A-': {
    'A-': true,
    'O-': true,
    'A+': false,
    'O+': false,
    'B+': false,
    'B-': false,
    'AB+': false,
    'AB-': false
  },
  'B+': {
    'B+': true,
    'B-': true,
    'O+': true,
    'O-': true,
    'A+': false,
    'A-': false,
    'AB+': false,
    'AB-': false
  },
  'B-': {
    'B-': true,
    'O-': true,
    'B+': false,
    'O+': false,
    'A+': false,
    'A-': false,
    'AB+': false,
    'AB-': false
  },
  'AB+': {
    'A+': true,
    'A-': true,
    'B+': true,
    'B-': true,
    'AB+': true,
    'AB-': true,
    'O+': true,
    'O-': true
  },
  'AB-': {
    'A-': true,
    'B-': true,
    'AB-': true,
    'O-': true,
    'A+': false,
    'B+': false,
    'AB+': false,
    'O+': false
  },
  'O+': {
    'O+': true,
    'O-': true,
    'A+': false,
    'A-': false,
    'B+': false,
    'B-': false,
    'AB+': false,
    'AB-': false
  },
  'O-': {
    'O-': true,
    'O+': false,
    'A+': false,
    'A-': false,
    'B+': false,
    'B-': false,
    'AB+': false,
    'AB-': false
  }
};

// Get compatible donor blood types for a recipient
export function getCompatibleDonorTypes(recipientBloodType: string): string[] {
  const compatibilityMap = BLOOD_COMPATIBILITY_MATRIX[recipientBloodType] || {};
  return Object.entries(compatibilityMap)
    .filter(([_, isCompatible]) => isCompatible)
    .map(([donorType]) => donorType);
}

// Get compatible recipient blood types for a donor
export function getCompatibleRecipientTypes(donorBloodType: string): string[] {
  return Object.entries(BLOOD_COMPATIBILITY_MATRIX)
    .filter(([_, compatibilityMap]) => compatibilityMap[donorBloodType])
    .map(([recipientType]) => recipientType);
}

// Calculate compatibility percentage between two blood types
export function calculateCompatibilityPercentage(donorBloodType: string, recipientBloodType: string): number {
  // Direct compatibility check
  const isCompatible = BLOOD_COMPATIBILITY_MATRIX[recipientBloodType]?.[donorBloodType] || false;
  
  if (!isCompatible) return 0;
  
  // Calculate rarity factor
  const rarityFactor = getRarityFactor(donorBloodType);
  
  // Calculate urgency factor
  const urgencyFactor = getUrgencyFactor(recipientBloodType);
  
  // Calculate final score (0-100)
  return Math.round((0.7 + (rarityFactor * 0.15) + (urgencyFactor * 0.15)) * 100);
}

// Get rarity factor for blood type (0-1)
function getRarityFactor(bloodType: string): number {
  // Based on global distribution percentages
  const rarityMap: Record<string, number> = {
    'O+': 0.3,   // Most common
    'A+': 0.4,
    'B+': 0.5,
    'AB+': 0.7,
    'O-': 0.8,
    'A-': 0.85,
    'B-': 0.9,
    'AB-': 1.0   // Rarest
  };
  
  return rarityMap[bloodType] || 0.5;
}

// Get urgency factor for recipient blood type (0-1)
function getUrgencyFactor(bloodType: string): number {
  // Based on how difficult it is to find compatible donors
  const urgencyMap: Record<string, number> = {
    'AB+': 0.1,  // Universal recipient (least urgent)
    'AB-': 0.3,
    'A+': 0.5,
    'B+': 0.6,
    'A-': 0.7,
    'B-': 0.8,
    'O+': 0.9,
    'O-': 1.0    // Universal donor (most urgent)
  };
  
  return urgencyMap[bloodType] || 0.5;
}

// Get blood type description
export function getBloodTypeDescription(bloodType: string): string {
  const descriptions: Record<string, string> = {
    'O-': 'Universal donor - can donate to all blood types',
    'O+': 'Can donate to O+, A+, B+, and AB+ recipients',
    'A-': 'Can donate to A-, A+, AB-, and AB+ recipients',
    'A+': 'Can donate to A+ and AB+ recipients',
    'B-': 'Can donate to B-, B+, AB-, and AB+ recipients',
    'B+': 'Can donate to B+ and AB+ recipients',
    'AB-': 'Can donate to AB- and AB+ recipients',
    'AB+': 'Universal recipient - can receive from all blood types'
  };
  
  return descriptions[bloodType] || 'Blood type compatibility information not available';
}