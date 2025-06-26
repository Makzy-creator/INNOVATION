import { supabase } from '../config/supabase';
import type { UserProfile, TransactionHistory, ProfileMetadata, DocumentStorage } from '../config/supabase';

class SupabaseService {
  // User Profile Management
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by wallet:', error);
      return null;
    }
  }

  // Transaction History Management
  async recordTransaction(transaction: Omit<TransactionHistory, 'id' | 'created_at'>): Promise<TransactionHistory | null> {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording transaction:', error);
      return null;
    }
  }

  async getUserTransactions(userId: string): Promise<TransactionHistory[]> {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  async updateTransactionStatus(transactionHash: string, status: TransactionHistory['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transaction_history')
        .update({ status })
        .eq('transaction_hash', transactionHash);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
  }

  async getTransactionByHash(transactionHash: string): Promise<TransactionHistory | null> {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('transaction_hash', transactionHash)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction by hash:', error);
      return null;
    }
  }

  // Profile Metadata Management
  async saveProfileMetadata(metadata: Omit<ProfileMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<ProfileMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('profile_metadata')
        .upsert([metadata], { onConflict: 'user_id,metadata_type' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving profile metadata:', error);
      return null;
    }
  }

  async getUserMetadata(userId: string, metadataType?: ProfileMetadata['metadata_type']): Promise<ProfileMetadata[]> {
    try {
      let query = supabase
        .from('profile_metadata')
        .select('*')
        .eq('user_id', userId);

      if (metadataType) {
        query = query.eq('metadata_type', metadataType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user metadata:', error);
      return [];
    }
  }

  // Document Storage Management
  async uploadDocument(file: File, userId: string, documentType: DocumentStorage['document_type']): Promise<DocumentStorage | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}/${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Record document in database
      const documentRecord: Omit<DocumentStorage, 'id' | 'created_at'> = {
        user_id: userId,
        document_type: documentType,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        verified: false
      };

      const { data, error } = await supabase
        .from('document_storage')
        .insert([documentRecord])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  async getUserDocuments(userId: string): Promise<DocumentStorage[]> {
    try {
      const { data, error } = await supabase
        .from('document_storage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return [];
    }
  }

  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  async verifyDocument(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('document_storage')
        .update({ verified: true })
        .eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error verifying document:', error);
      return false;
    }
  }

  // Authentication helpers
  async signUp(email: string, password: string, userData: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Real-time subscriptions
  subscribeToUserTransactions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_history',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Platform statistics
  async getPlatformStats() {
    try {
      const [usersResult, transactionsResult] = await Promise.all([
        supabase.from('user_profiles').select('role', { count: 'exact' }),
        supabase.from('transaction_history').select('transaction_type', { count: 'exact' })
      ]);

      const userStats = usersResult.data?.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      const transactionStats = transactionsResult.data?.reduce((acc: any, tx) => {
        acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalUsers: usersResult.count || 0,
        donors: userStats.donor || 0,
        recipients: userStats.recipient || 0,
        admins: userStats.admin || 0,
        totalTransactions: transactionsResult.count || 0,
        donations: transactionStats.donation || 0,
        requests: transactionStats.request || 0,
        fulfillments: transactionStats.fulfillment || 0
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return null;
    }
  }
}

export default new SupabaseService();