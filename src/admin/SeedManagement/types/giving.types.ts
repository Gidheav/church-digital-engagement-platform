/**
 * Type definitions for Giving/Seed Manager
 */

export type GivingCategory = 'Tithes' | 'Offerings' | 'Projects' | 'Fundraising';
export type GivingVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'HIDDEN';
export type GivingStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface GivingItem {
  id: string;
  category: GivingCategory;
  title: string;
  description: string;
  icon: string;
  visibility: GivingVisibility;
  status: GivingStatus;
  is_featured: boolean;
  is_recurring_enabled: boolean;
  suggested_amounts: number[];
  goal_amount: number | null;
  raised_amount: number;
  deadline: string;
  verse: string;
  cover_image: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  total_donations: number;
  donor_count: number;
}

export interface CategoryOption {
  value: GivingCategory;
  label: string;
  icon: string;
  desc: string;
}

export interface VisibilityOption {
  value: GivingVisibility;
  label: string;
  icon: string;
  desc: string;
}

export interface StatusOption {
  value: GivingStatus;
  label: string;
  color: string;
}
