-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('creator', 'brand', 'admin')),
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator-specific information
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  user_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_code TEXT,
  phone TEXT,
  niches TEXT[] DEFAULT '{}',
  audience_tier TEXT CHECK (audience_tier IN ('nano', 'micro', 'macro', 'mega')),
  bio TEXT,
  social_platforms JSONB DEFAULT '[]',
  audience_locations JSONB DEFAULT '[]',
  content_language TEXT,
  audience_demographic TEXT,
  packages JSONB DEFAULT '[]',
  turnaround_days INTEGER,
  usage_rights TEXT,
  portfolio_urls JSONB DEFAULT '[]',
  payout_method TEXT,
  payout_currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand-specific information
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_description TEXT,
  website TEXT,
  industry TEXT
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  guidelines TEXT,
  budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones (escrow-driven)
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'UNFUNDED' CHECK (state IN ('UNFUNDED', 'FUNDED', 'UNDER_REVIEW', 'COMPLETED', 'DISPUTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications (creator applies to campaign)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id)
);

-- Content submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_urls JSONB DEFAULT '[]',
  external_urls JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_milestones_campaign_id ON public.milestones(campaign_id);
CREATE INDEX idx_milestones_state ON public.milestones(state);
CREATE INDEX idx_applications_campaign_id ON public.applications(campaign_id);
CREATE INDEX idx_applications_creator_id ON public.applications(creator_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_submissions_milestone_id ON public.submissions(milestone_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Creators: only the creator can view/update their own
CREATE POLICY "Creators viewable by owner" ON public.creators
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Creators updatable by owner" ON public.creators
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Creators insertable by owner" ON public.creators
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Brands: viewable by everyone, updatable by owner
CREATE POLICY "Brands viewable by everyone" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Brands updatable by owner" ON public.brands
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Brands insertable by owner" ON public.brands
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Campaigns: active campaigns are public, brand sees their own
CREATE POLICY "Campaigns viewable by everyone (active)" ON public.campaigns
  FOR SELECT USING (status = 'active' OR brand_id = auth.uid());

CREATE POLICY "Campaigns insertable by brand" ON public.campaigns
  FOR INSERT WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Campaigns updatable by brand owner" ON public.campaigns
  FOR UPDATE USING (brand_id = auth.uid());

-- Milestones: viewable by campaign participants
CREATE POLICY "Milestones viewable by participants" ON public.milestones
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE brand_id = auth.uid()
    ) OR campaign_id IN (
      SELECT campaign_id FROM public.applications WHERE creator_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Milestones updatable by brand" ON public.milestones
  FOR UPDATE USING (
    campaign_id IN (SELECT id FROM public.campaigns WHERE brand_id = auth.uid())
  );

-- Applications: creators see their own, brands see applications to their campaigns
CREATE POLICY "Applications viewable by participants" ON public.applications
  FOR SELECT USING (
    creator_id = auth.uid() OR
    campaign_id IN (SELECT id FROM public.campaigns WHERE brand_id = auth.uid())
  );

CREATE POLICY "Applications insertable by creator" ON public.applications
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Applications updatable by brand" ON public.applications
  FOR UPDATE USING (
    campaign_id IN (SELECT id FROM public.campaigns WHERE brand_id = auth.uid())
  );

-- Submissions: viewable by campaign participants
CREATE POLICY "Submissions viewable by participants" ON public.submissions
  FOR SELECT USING (
    creator_id = auth.uid() OR
    milestone_id IN (
      SELECT id FROM public.milestones WHERE campaign_id IN (
        SELECT id FROM public.campaigns WHERE brand_id = auth.uid()
      )
    )
  );

CREATE POLICY "Submissions insertable by creator" ON public.submissions
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Notifications: users see only their own
CREATE POLICY "Notifications viewable by recipient" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Notifications updatable by recipient" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
