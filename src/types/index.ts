export type UserRole = "creator" | "brand" | "admin"

export type MilestoneState = "UNFUNDED" | "FUNDED" | "UNDER_REVIEW" | "COMPLETED" | "DISPUTED"

export type CampaignStatus = "active" | "completed" | "cancelled"

export type ApplicationStatus = "pending" | "accepted" | "rejected"

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole | null
  user_name: string | null
  created_at: string
}

export type AudienceTier = "nano" | "micro" | "macro" | "mega"

export interface Creator {
  id: string
  full_name: string | null
  user_name: string | null
  bank_account_number: string | null
  bank_name: string | null
  bank_code: string | null
  phone: string | null
  niches: string[] | null
  audience_tier: AudienceTier | null
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  company_name: string | null
  company_description: string | null
  website: string | null
  industry: string | null
}

export interface Campaign {
  id: string
  brand_id: string
  title: string
  description: string
  guidelines: string | null
  budget: number
  deadline: string
  status: CampaignStatus
  created_at: string
  brand?: Profile
}

export interface Milestone {
  id: string
  campaign_id: string
  title: string
  description: string | null
  amount: number
  state: MilestoneState
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  campaign_id: string
  creator_id: string
  status: ApplicationStatus
  message: string | null
  created_at: string
  creator?: Profile
  campaign?: Campaign
}

export interface Submission {
  id: string
  milestone_id: string
  creator_id: string
  content: string | null
  file_urls: string[]
  external_urls: string[]
  submitted_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, unknown>
}
