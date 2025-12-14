-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    country_code TEXT NOT NULL,
    email TEXT,
    company TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now ()
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON contacts (user_id);

CREATE INDEX idx_contacts_name ON contacts (name);

CREATE INDEX idx_contacts_phone ON contacts (phone_number);

CREATE INDEX idx_contacts_favorite ON contacts (is_favorite);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
-- Users can view their own contacts
CREATE POLICY "Users can view their own contacts" ON contacts FOR
SELECT USING (auth.uid () = user_id);

-- Users can create their own contacts
CREATE POLICY "Users can create their own contacts" ON contacts FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Users can update their own contacts
CREATE POLICY "Users can update their own contacts" ON contacts FOR
UPDATE USING (auth.uid () = user_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts" ON contacts FOR DELETE USING (auth.uid () = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_conference_updated_at();