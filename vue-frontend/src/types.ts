export interface BackendUser {
  id: number;
  email: string;
  full_name?: string;
  is_manager: boolean;
  is_superuser: boolean;
}

export interface TimeOffRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  type: 'leave' | 'permit';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface Unit {
  id: number;
  name: string;
}

export interface UserAdmin {
  id: number;
  email: string;
  full_name?: string;
  is_manager: boolean;
  is_superuser: boolean;
  units: Unit[];
  managed_units: Unit[];
}
