-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'recipient', 'admin')),
    blood_type VARCHAR(5),
    location TEXT,
    phone VARCHAR(20),
    wallet_address VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history table
CREATE TABLE transaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'request', 'fulfillment')),
    amount INTEGER,
    blood_type VARCHAR(5),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile metadata table
CREATE TABLE profile_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    metadata_type VARCHAR(20) NOT NULL CHECK (metadata_type IN ('medical', 'verification', 'preferences')),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document storage table
CREATE TABLE document_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('medical_report', 'id_verification', 'blood_test')),
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_transaction_history_user ON transaction_history(user_id);
CREATE INDEX idx_transaction_history_hash ON transaction_history(transaction_hash);
CREATE INDEX idx_transaction_history_type ON transaction_history(transaction_type);
CREATE INDEX idx_profile_metadata_user ON profile_metadata(user_id);
CREATE INDEX idx_profile_metadata_type ON profile_metadata(metadata_type);
CREATE INDEX idx_document_storage_user ON document_storage(user_id);
CREATE INDEX idx_document_storage_type ON document_storage(document_type);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can view their own transaction history
CREATE POLICY "Users can view own transactions" ON transaction_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transaction_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can view and manage their own metadata
CREATE POLICY "Users can view own metadata" ON profile_metadata
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own metadata" ON profile_metadata
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own metadata" ON profile_metadata
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can view and manage their own documents
CREATE POLICY "Users can view own documents" ON document_storage
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own documents" ON document_storage
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_metadata_updated_at BEFORE UPDATE ON profile_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();