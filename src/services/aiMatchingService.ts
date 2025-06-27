import * as tf from '@tensorflow/tfjs';
import SupabaseService from './supabaseService';
import { BLOOD_COMPATIBILITY_MATRIX } from '../utils/bloodTypeUtils';

interface MatchingCriteria {
  bloodType: string;
  location: string;
  urgency: string;
  distance: number;
  medicalCondition?: string;
}

interface MatchResult {
  userId: string;
  score: number;
  compatibility: number;
  distance: number;
  urgencyScore: number;
  availabilityScore: number;
}

class AIMatchingService {
  private model: tf.Sequential | null = null;
  private isModelLoaded = false;
  private isTraining = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Create a sequential model
      this.model = tf.sequential();
      
      // Add layers
      this.model.add(tf.layers.dense({
        units: 16,
        inputShape: [5], // [compatibility, distance, urgency, availability, history]
        activation: 'relu'
      }));
      
      this.model.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));
      
      this.model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));
      
      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
      
      this.isModelLoaded = true;
      console.log('✅ AI Matching model initialized');
      
      // Train with initial data
      this.trainModel();
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
    }
  }

  private async trainModel() {
    if (!this.model || this.isTraining) return;
    
    this.isTraining = true;
    
    try {
      // In a real app, we would fetch historical matching data from Supabase
      // For now, we'll use synthetic data
      
      // Generate synthetic training data
      const numSamples = 100;
      const inputData = [];
      const outputData = [];
      
      for (let i = 0; i < numSamples; i++) {
        // Generate random features
        const compatibility = Math.random(); // 0-1
        const distance = Math.random(); // 0-1 (normalized)
        const urgency = Math.random(); // 0-1
        const availability = Math.random(); // 0-1
        const history = Math.random(); // 0-1
        
        // Generate synthetic match success (1 = good match, 0 = poor match)
        // Higher compatibility, lower distance, higher urgency, higher availability, and better history
        // should lead to better matches
        const matchSuccess = 
          compatibility * 0.4 + 
          (1 - distance) * 0.2 + 
          urgency * 0.2 + 
          availability * 0.1 + 
          history * 0.1 > 0.6 ? 1 : 0;
        
        inputData.push([compatibility, distance, urgency, availability, history]);
        outputData.push([matchSuccess]);
      }
      
      // Convert to tensors
      const xs = tf.tensor2d(inputData);
      const ys = tf.tensor2d(outputData);
      
      // Train the model
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });
      
      console.log('✅ AI Matching model trained');
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
    } catch (error) {
      console.error('Failed to train AI model:', error);
    } finally {
      this.isTraining = false;
    }
  }

  async findMatches(criteria: MatchingCriteria, limit: number = 10): Promise<MatchResult[]> {
    try {
      if (!this.isModelLoaded) {
        await this.initializeModel();
      }
      
      // In a real app, we would fetch potential donors from Supabase
      // For now, we'll use synthetic data
      const potentialDonors = await this.getPotentialDonors(criteria.bloodType);
      
      // Calculate match scores
      const matchResults: MatchResult[] = [];
      
      for (const donor of potentialDonors) {
        // Calculate individual scores
        const compatibilityScore = this.calculateBloodCompatibility(criteria.bloodType, donor.bloodType);
        const distanceScore = this.calculateDistanceScore(criteria.location, donor.location);
        const urgencyScore = this.calculateUrgencyScore(criteria.urgency);
        const availabilityScore = donor.lastDonation 
          ? this.calculateAvailabilityScore(donor.lastDonation)
          : 1.0;
        const historyScore = donor.donationCount / 10; // Normalize by 10 donations
        
        // Use the model to predict match score
        const inputTensor = tf.tensor2d([
          [compatibilityScore, distanceScore, urgencyScore, availabilityScore, historyScore]
        ]);
        
        const prediction = this.model!.predict(inputTensor) as tf.Tensor;
        const score = (await prediction.data())[0];
        
        // Clean up tensor
        inputTensor.dispose();
        prediction.dispose();
        
        matchResults.push({
          userId: donor.id,
          score: score,
          compatibility: compatibilityScore,
          distance: donor.distance,
          urgencyScore,
          availabilityScore
        });
      }
      
      // Sort by score and take top matches
      return matchResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Match finding error:', error);
      return [];
    }
  }

  private calculateBloodCompatibility(recipientType: string, donorType: string): number {
    // Use the compatibility matrix
    return BLOOD_COMPATIBILITY_MATRIX[recipientType]?.[donorType] ? 1.0 : 0.0;
  }

  private calculateDistanceScore(location1: string, location2: string): number {
    // In a real app, we would use geocoding and calculate actual distance
    // For now, we'll return a random score between 0 and 1
    // Lower is better (closer)
    return Math.random();
  }

  private calculateUrgencyScore(urgency: string): number {
    switch (urgency) {
      case 'critical': return 1.0;
      case 'high': return 0.75;
      case 'medium': return 0.5;
      case 'low': return 0.25;
      default: return 0.5;
    }
  }

  private calculateAvailabilityScore(lastDonation: Date): number {
    // Check if donor is eligible (56 days since last donation)
    const now = new Date();
    const daysSinceLastDonation = (now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastDonation < 56) {
      return 0.0; // Not eligible
    }
    
    // Score increases the longer it's been since last donation
    return Math.min(1.0, (daysSinceLastDonation - 56) / 30);
  }

  private async getPotentialDonors(bloodType: string) {
    // In a real app, we would fetch from Supabase
    // For now, we'll return synthetic data
    
    // Generate 20 synthetic donors
    const donors = [];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (let i = 0; i < 20; i++) {
      const randomBloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const lastDonationDays = Math.floor(Math.random() * 120);
      const lastDonation = new Date();
      lastDonation.setDate(lastDonation.getDate() - lastDonationDays);
      
      donors.push({
        id: `donor-${i}`,
        name: `Donor ${i}`,
        bloodType: randomBloodType,
        location: 'Sample Location',
        distance: Math.random() * 50, // 0-50 km
        lastDonation: lastDonation,
        donationCount: Math.floor(Math.random() * 20) // 0-20 donations
      });
    }
    
    return donors;
  }

  async getMatchingRecommendations(userId: string, bloodType: string, location: string): Promise<any[]> {
    try {
      // Get user's blood requests
      const userRequests = await SupabaseService.getUserTransactions(userId);
      const openRequests = userRequests.filter(tx => 
        tx.transaction_type === 'request' && 
        tx.status === 'pending'
      );
      
      if (openRequests.length === 0) {
        return [];
      }
      
      // Get the most recent request
      const latestRequest = openRequests.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Find matches for this request
      const matches = await this.findMatches({
        bloodType: latestRequest.blood_type || bloodType,
        location: latestRequest.metadata?.location || location,
        urgency: latestRequest.metadata?.urgency || 'medium',
        distance: 50 // Default max distance in km
      });
      
      return matches;
    } catch (error) {
      console.error('Failed to get matching recommendations:', error);
      return [];
    }
  }

  async getCompatibilityScore(donorBloodType: string, recipientBloodType: string): Promise<number> {
    return this.calculateBloodCompatibility(recipientBloodType, donorBloodType);
  }

  async getMatchingStatistics(): Promise<any> {
    // In a real app, we would calculate these from actual data
    return {
      averageMatchTime: 12.5, // hours
      successRate: 85, // percentage
      averageDistance: 15.3, // km
      criticalRequestsMatched: 98, // percentage
    };
  }
}

export default new AIMatchingService();