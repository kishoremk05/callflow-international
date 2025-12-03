
-- Create enum types
CREATE TYPE public.user_role AS ENUM ('user', 'enterprise_admin', 'enterprise_member', 'admin');
CREATE TYPE public.call_status AS ENUM ('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_provider AS ENUM ('stripe', 'razorpay');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country_code TEXT DEFAULT 'US',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Wallet table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enterprise accounts table
CREATE TABLE public.enterprise_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enterprise members table
CREATE TABLE public.enterprise_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_limit DECIMAL(10, 2) DEFAULT 0.00,
  used_credits DECIMAL(10, 2) DEFAULT 0.00,
  can_make_calls BOOLEAN DEFAULT true,
  can_purchase_numbers BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enterprise_id, user_id)
);

-- Purchased numbers table
CREATE TABLE public.purchased_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  enterprise_id UUID REFERENCES public.enterprise_accounts(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL UNIQUE,
  twilio_sid TEXT NOT NULL,
  country_code TEXT NOT NULL,
  monthly_cost DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Public numbers (system-provided caller IDs)
CREATE TABLE public.public_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  twilio_sid TEXT NOT NULL,
  country_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate settings table (admin-configurable)
CREATE TABLE public.rate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  cost_per_minute DECIMAL(10, 4) NOT NULL,
  sell_rate_per_minute DECIMAL(10, 4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_code)
);

-- Call logs table
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES public.enterprise_accounts(id) ON DELETE SET NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  to_country_code TEXT NOT NULL,
  caller_id_type TEXT NOT NULL CHECK (caller_id_type IN ('public', 'purchased')),
  caller_id_number TEXT NOT NULL,
  twilio_call_sid TEXT,
  status call_status NOT NULL DEFAULT 'initiated',
  duration_seconds INTEGER DEFAULT 0,
  twilio_cost DECIMAL(10, 4) DEFAULT 0,
  billed_amount DECIMAL(10, 4) DEFAULT 0,
  profit_margin DECIMAL(10, 4) DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES public.enterprise_accounts(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider payment_provider NOT NULL,
  provider_payment_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  credits_added DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for enterprise_accounts
CREATE POLICY "Enterprise admins can view their enterprise" ON public.enterprise_accounts
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Enterprise admins can update their enterprise" ON public.enterprise_accounts
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Admins can view all enterprises" ON public.enterprise_accounts
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for enterprise_members
CREATE POLICY "Enterprise members can view their membership" ON public.enterprise_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enterprise admins can manage members" ON public.enterprise_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_accounts
      WHERE id = enterprise_id AND admin_id = auth.uid()
    )
  );

-- RLS Policies for purchased_numbers
CREATE POLICY "Users can view their purchased numbers" ON public.purchased_numbers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all numbers" ON public.purchased_numbers
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for public_numbers (read-only for authenticated users)
CREATE POLICY "Authenticated users can view public numbers" ON public.public_numbers
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage public numbers" ON public.public_numbers
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for rate_settings (read-only for authenticated users)
CREATE POLICY "Authenticated users can view rates" ON public.rate_settings
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage rates" ON public.rate_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for call_logs
CREATE POLICY "Users can view their own call logs" ON public.call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs" ON public.call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all call logs" ON public.call_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_accounts_updated_at
  BEFORE UPDATE ON public.enterprise_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_settings_updated_at
  BEFORE UPDATE ON public.rate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rate settings for common countries
INSERT INTO public.rate_settings (country_code, country_name, cost_per_minute, sell_rate_per_minute) VALUES
  ('US', 'United States', 0.0085, 0.02),
  ('GB', 'United Kingdom', 0.0120, 0.03),
  ('CA', 'Canada', 0.0090, 0.025),
  ('AU', 'Australia', 0.0150, 0.035),
  ('IN', 'India', 0.0080, 0.02),
  ('DE', 'Germany', 0.0130, 0.03),
  ('FR', 'France', 0.0125, 0.03),
  ('JP', 'Japan', 0.0200, 0.045),
  ('SG', 'Singapore', 0.0100, 0.025),
  ('AE', 'UAE', 0.0180, 0.04);
