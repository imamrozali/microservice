export interface Role {
  id: string;
  code: string;
  name: string;
  created_at: Date;
}

export interface User {
  full_name: string;
  id: string;
  username: string;
  email: string;
  password: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
}
