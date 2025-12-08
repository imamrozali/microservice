export interface Role {
  id: string;
  code: string;
  name: string;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  job_position?: string;
  phone_number?: string;
  photo_url?: string;
  profile_picture?: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  role?: {
    role_name: string;
  };
}
