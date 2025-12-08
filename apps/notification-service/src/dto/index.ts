export class CreateEmployeeProfileDto {
  user_id: string;
  first_name: string;
  last_name: string;
  position: string;
}

export class UpdateEmployeeProfileDto {
  first_name?: string;
  last_name?: string;
  position?: string;
}
