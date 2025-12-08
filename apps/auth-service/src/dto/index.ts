export class CreateRoleDto {
  code: string;
  name: string;
}

export class UpdateRoleDto {
  code?: string;
  name?: string;
}

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
}

export class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role_id?: string;
  is_active?: boolean;
}
