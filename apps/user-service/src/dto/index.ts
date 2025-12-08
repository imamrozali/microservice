export class CreateRoleDto {
  code: string;
  name: string;
}

export class UpdateRoleDto {
  code?: string;
  name?: string;
}

export class CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  job_position?: string;
  phone_number?: string;
  photo_url?: string;
  role_id: string;
  is_active?: boolean;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  full_name?: string;
  job_position?: string;
  phone_number?: string;
  photo_url?: string;
  profile_picture?: string;
  role_id?: string;
  is_active?: boolean;
}

export class VerifyUserDto {
  email: string;
  password: string;
}
